---
title: "The checkout that doesn't know who's listening"
description: "A walk through the events showcase project: a checkout announces each order, two other contexts react, and the checkout never names either of them. How Bynk's events are declared, filtered, deduplicated and tested, and what they don't do yet."
date: 2026-11-24
authors: matthew
tags: [agents, capabilities, testing]
excerpt: "A checkout announces each order, and loyalty points and a sales tally react without the checkout ever naming them. A walk through Bynk's events."
series: inside-the-showcase
level: designing
showcase: events
bynkVersion: 0.639.1
---

## What it builds

A small shop has a checkout. When someone places an order, two other parts of
the business need to know: the loyalty scheme, which awards points, and the
sales tally, which keeps running totals. The obvious way to build that is for
the checkout to call each of them. Then the checkout has to know about every
part of the business that cares about orders, and every new one means changing
the checkout.

The [`events`](https://github.com/bynk-lang/showcase/tree/main/events) showcase
project builds it the other way round. The checkout announces each order as an
**event**, a typed record of something that happened, and anything that cares
subscribes to it. The checkout never names its listeners. This is
*publish and subscribe*, built into the language: the compiler, not your code,
wires each event to the services that listen for it.

If you come from TypeScript, it sits between two things you may know. Node's
`EventEmitter` is in one process, with listeners added while the program
runs. A broker such as SNS, Kafka or Cloudflare Queues works between services,
with subscriptions set up separately from the code. Bynk's listeners live in
other services, so delivery crosses the network, as with a broker, but the
subscriptions come from the source, and each listener receives the event as a
typed record, with an envelope of details such as its `eventId`.

## The layout

The project is three **contexts**: separate parts of a Bynk system, each with
its own services and agents, deployed as its own Cloudflare Worker (a small
program that Cloudflare runs on its servers).

- `shop.orders`, the checkout, declares the `OrderPlaced` event and emits it.
- `shop.loyalty` listens for domestic orders and awards points.
- `shop.sales` listens for every order and keeps a tally.

The two listeners depend on the checkout, but only to name its event. The
checkout depends on neither of them, and the listeners don't know about each
other. Each context has a test file of its own.

## A walk through the code

**The checkout declares what it announces.** `src/shop/orders.bynk` starts by
saying what it needs and what it shares:

```bynk
context shop.orders

consumes bynk { Events }
exports transparent { OrderPlaced, Region }
```

`Events` is the capability that emits events: a power a handler must ask for
in its signature before it can use it. `exports transparent` lets other contexts see
`OrderPlaced` and `Region`, fields and all, which a listener needs in order to
read an order. Then comes the event itself, which is just a record shape:

```bynk
type Region = enum { Domestic, International }

---
A fact: an order was placed. An event is a plain record shape, declared in the
one context allowed to emit it.
---
event OrderPlaced = {
	orderId: String,
	customer: String,
	region: Region,
	totalPence: Int,
}
```

That doc comment states a rule the compiler enforces: only the context that
declares an event may emit it. A listener can see `OrderPlaced`, but if it
tried to emit one, the build would fail with
`bynk.event.emit_outside_owner`. Being able to subscribe to an event doesn't
let you forge one.

**The checkout emits after its check.** The service that takes an order
refuses an empty one, and only announces an order it accepted:

```bynk
service checkout {
	on call(
		orderId: String,
		customer: String,
		region: Region,
		totalPence: Int
	) -> Effect[Result[(), String]] given Events {
		if totalPence <= 0 {
			Err("an order must cost something")
		} else {
			let _ <- Events.emit[OrderPlaced](OrderPlaced {
				orderId: orderId,
				customer: customer,
				region: region,
				totalPence: totalPence,
			})
			Ok(())
		}
	}
}
```

`given Events` in the signature says this handler may emit, so a reader can
tell what it touches from its first line. `let _ <- …` runs an effect, waits
for it to finish and ignores its result. Here, finishing means the event has
been handed over for delivery, not that anyone has received it. Emitting is
fire-and-forget: the checkout learns nothing about who heard the event or how
they got on, which is exactly what keeps it independent of them. Nothing in
this file mentions loyalty or sales.

**The loyalty scheme subscribes, with a filter.** In `src/shop/loyalty.bynk`,
a service listens for the event. Its header names what it hears, and a pattern
narrows it to domestic orders:

```bynk
service AwardPoints from Events(OrderPlaced { region: Region.Domestic, .. }) {
	on event(e: OrderPlaced) -> Effect[()] {
		Points(e.customer).award(e.orderId, e.totalPence / PencePerPoint)
	}
}
```

The filter is worth understanding precisely. Every subscriber is still
delivered every `OrderPlaced`. The code the compiler generates for this
service checks the pattern first, and drops an international order before
the body runs. So `e` is still an ordinary `OrderPlaced` inside the handler:
the pattern decides *whether* the body runs, not what type `e` has.

The body hands the work to `Points`, an **agent**: a piece of state, here
each customer's balance, together with the handlers that change it. One
point is earned per whole pound, so `PencePerPoint` is `100`.

**The same order can arrive twice.** The Book describes event delivery as
*at least once*, and tells listeners to expect duplicates: an emission can
reach a listener again, for instance after a restart. That's a promise about
duplicates, not retries: Bynk doesn't re-run a listener that failed (more on
that below). A more ordinary duplicate comes from the customer. One whose
checkout timed out may resubmit it, which emits a second, separate event for
the same order. If the loyalty scheme simply added points each time, a customer could
earn them twice. So `Points` remembers which orders it has already awarded:

```bynk
on call award(orderId: String, points: Int) -> Effect[()] given Clock {
	let seen <- awarded.get(orderId)
	match seen {
		Some(_) => (),
		None => {
			do awarded.put(orderId, ())
			let _ <- balance.update((n) => n + points)
		},
	}
}
```

(`do x` is the short way to write `let _ <- x`: run an effect and ignore its
result.) Two decisions here are worth stealing.

First, it checks the **order's id**, not the event's. Every emission carries
an envelope with an `eventId`, and a redelivery repeats it, but a resubmitted
checkout is a new emission with a new `eventId`. Only `orderId` catches both
kinds of duplicate.

Second, the check lives **inside the agent**, beside the balance. An agent
commits all of a handler's writes together when the handler finishes, or none
of them if it fails. So the mark ("this order is awarded") and the points
can't get out of step. Bynk has an `Idempotency` capability for deduplication
too, but checking and recording with it would be separate calls from the
award, and a failure between them could lose the points or award them twice.

The set of awarded orders is a `Cache` with a seven-day lifetime
(`@ttl(7.days)`): the project's judgement of how long a duplicate could take
to turn up, not a figure the Book promises. Checking whether an entry has expired
reads the clock, which is why the handler says `given Clock`.

**The sales tally is a second, independent listener.** `src/shop/sales.bynk`
has no pattern, so it hears every order, whatever its region:

```bynk
service TallySale from Events(OrderPlaced) {
	on event(e: OrderPlaced) -> Effect[()] {
		Takings("all").add(e.orderId, e.totalPence)
	}
}
```

Its `Takings` agent removes duplicates the same way, by order id and in the
same handler that adds to the totals. Adding this listener took no change to
the checkout's code or to the loyalty scheme. That's the point of the whole
design. (The checkout's Worker does change: the compiler gives it a
connection to each listener, so adding one means deploying the checkout
again.)

**What events don't do yet.** The Book is candid about the current limits,
and they shape how you'd use events in a real system:

- **No retry, and no replay.** If a listener fails while handling an event,
  the failure is logged, and its siblings still get theirs. But that delivery
  isn't tried again, and there's no durable log to replay missed events from
  yet.
- **Limited ordering.** Everything one call of a handler emits arrives in
  order, and so do events from one agent's successive calls. Events from
  overlapping calls can arrive in either order. A listener that needs a strict
  order needs the publisher to put a sequence number in the event.
- **Every listener hears every event.** A pattern filters inside the
  listener, not in the delivery, so a narrow listener still runs, briefly,
  for every emission.
- **A listener mustn't also call its publisher, if you want to deploy it.**
  A listener that only names the event deploys before the checkout, because
  the checkout's Worker is bound to it (set up to call it directly) and
  Cloudflare won't deploy a Worker bound to one that doesn't exist yet. If the listener also called a
  service in the checkout, each Worker would need the other to exist first,
  and `bynk deploy` refuses the project, though `bynk dev` serves it.

## The tests

Each context is tested on its own, which is the decoupling again: the
publisher's tests run no listener, and the listeners' tests need no checkout.

**The publisher alone.** In a test, `Events` is a *double*: a stand-in that
records what the code asked of it, instead of delivering anything. So the
checkout's tests check that it announced an order, and that it didn't
announce a refused one:

```bynk
case "a placed order is announced once" {
	let r <- checkout.call("o-1", "ada", Region.Domestic, 2500)
	expect r is Ok(_)
	expect Events.emit called once
}

case "a refused order is never announced" {
	let r <- checkout.call("o-2", "ada", Region.Domestic, 0)
	expect r is Err(_)
	expect Events.emit called 0 times
}
```

**Each listener alone.** `AwardPoints.event(...)` delivers one event straight
to the listener, through the same generated code that real delivery uses, so
the pattern filter applies. One case checks that an international order earns
nothing. Another delivers the same order twice:

```bynk
case "the same order earns nothing the second time" {
	// Each delivery here gets a fresh `eventId`, as a resubmitted checkout's
	// second emission would. A redelivery repeats the `eventId` too, but the
	// handler never reads it: the `orderId` is the same, so it is one award.
	let _ <- AwardPoints.event(order("o-1", Region.Domestic))
	let _ <- AwardPoints.event(order("o-1", Region.Domestic))
	let points <- Points("ada").current()
	expect points == 25
}
```

(`order` is a small helper in the test file that builds a £25.99 order for a
customer called Ada, so 25 points is one award, not two.) The sales tally's
tests check the mirror image: it counts the international order that loyalty
ignored, and counts the same order delivered twice only once.

These tests deliver each event by hand, so they don't exercise the delivery
between contexts. A test at the `system` tier, which runs the code as it's
deployed, can't deliver an event by hand: it calls the handler that emits it,
so the event goes through the real delivery. This project doesn't include
one.

## Make it yours

Clone the showcase and run the tests:

```sh
git clone https://github.com/bynk-lang/showcase
cd showcase/events
bynk test .
```

Then try a couple of changes:

- **Add a third listener.** Create a context of your own that consumes
  `shop.orders` and declares a service `from Events(OrderPlaced)`: say, one
  that keeps a count of orders per customer. Notice that no code outside your
  new file changes, and that its tests can deliver events to it without the
  checkout. The checkout is deployed again, with a connection to your
  listener.
- **Try to forge an order.** In `shop.loyalty`, add `consumes bynk { Events }`
  and a service that emits an `OrderPlaced`. The build refuses it with
  `bynk.event.emit_outside_owner`, because only `shop.orders` may announce an
  order.
- **Spread the tally.** Every order goes through one `Takings("all")` agent.
  Try keying it by day instead, so each day's tally is its own agent, and see
  what changes in the tests.

To go further:

- [Understand events](https://bynk-lang.org/book/guides/events/understand-events/),
  the guide in the Bynk book, for envelopes, versioning events and delivery
  on each platform
- [Delivering an event](https://bynk-lang.org/book/reference/testing/#event-address),
  in the testing reference
- The [`queues`](https://github.com/bynk-lang/showcase/tree/main/queues)
  showcase project, for messages sent to one consumer, with retries

The checkout's code ends where its job does: an order is placed, and it says
so. Who listens, and what they do about it, is written somewhere else, and
can change without touching it.
