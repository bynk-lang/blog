---
title: "The order that arrived twice"
description: "Idempotency keys and retried requests: why checking for a repeat isn't enough when two copies arrive at once, and how Bynk's claim and remember work together."
date: 2026-12-02
authors: matthew
tags: [http, concurrency, errors]
excerpt: "A client that never saw an answer tries again. Bynk claims the key first, so one attempt does the work and every repeat gets its answer."
series: the-problem-with
level: building
showcase: idempotency
bynkVersion: 0.661.1
---

A customer on a train taps "Pay" for a sofa. The request reaches your
service, the order goes through, and the train goes into a tunnel before the
answer gets back. The app waits, gives up, and tries again. Did they buy one
sofa or two?

If your service treats the second request as a new order, they bought two.
This post is about making sure they bought one, and why the obvious way of
doing that isn't quite enough.

## The problem

Most systems that promise a message will get through promise it *at least
once*, which means they might deliver it more than once. A client retries a request
it never saw an answer to. A queue redelivers a message when the consumer
that took it was cut off. A webhook sender resends a notice when your answer
was slow. [*Who really sent this?*](../webhooks/) left exactly this to one
side: a correctly signed notice can still arrive twice. And in
[*The checkout that doesn't know who's listening*](../events/), the
subscribers had to cope with the same event turning up again.

Repeats come in two shapes:

- **Twice, later.** The first attempt finished, but its answer was lost. The
  retry arrives a second, or a minute, afterwards.
- **Twice, at once.** Two copies are in flight at the same moment: a client
  with an impatient timeout, or two queue consumers handed the same message.

The obvious fix is to remember what you've seen: before placing an order,
check whether this request has been handled already, and if not, handle it
and make a note. That works for the first shape. It fails the second,
because of the gap between checking and noting. Both copies check, both find
nothing, and both place an order. This is called *check-then-act*: a
decision made on something that can change before you act on it. It's the
same race as two people reading a shared balance, both seeing £100, and both
spending it.

## How it's usually handled

**An idempotency key.** An operation is *idempotent* when doing it twice has
the same effect as doing it once, and a key is how a service makes a request
idempotent. The client makes up a unique key for each operation
(a fresh UUID, say) and sends it with every attempt, usually in an
`Idempotency-Key` header. Stripe popularised the pattern: every `POST` to its
API accepts a key, and a retry with the same key gets the saved response of
the first attempt rather than a second charge. The header is now being
standardised, in the IETF's
[`draft-ietf-httpapi-idempotency-key-header`](https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/),
an Internet-Draft (a proposal, not yet an RFC), currently at revision `-09`.

**A table of keys, or a unique constraint.** On the server, the key goes into
a database. Done carefully, with the key as a unique column and the insert as
the very first step, the database settles the race: only one insert wins.

Both are good, and the second is how the problem is properly solved. Where
they stop short is in the details around them, each of which you decide by
hand:

- **The race.** A lookup followed by an insert is still check-then-act. Only
  an *atomic* "insert if absent" (one indivisible step, so nothing can
  happen in between) closes the gap, and it's easy to write the
  lookup first because it reads more naturally.
- **A first attempt that fails.** If the first attempt hits an outage, should
  the key now be spent? Stripe saves the response once the work has begun,
  including a `500`, so a retry gets the same error back; a request that
  fails validation, or collides with one still running, isn't saved and can
  be retried. Other services make other choices. Whatever yours is, every
  handler has to make it the same way.
- **A key reused for something else.** A buggy client might send the same key
  with a different body. Answering with the first order's result would tell
  it the second order went through. Stripe compares the parameters and
  refuses a mismatch, and the draft suggests a `422` for it.
- **How long to keep keys.** Stripe may prune a key once it's at least 24
  hours old, after which the same key is treated as a new request.

## Bynk's answer

Bynk has an `Idempotency` capability with two tools, and the point of this
post is that you need both.

**`claim(key, expiresAfter)` is first-delivery-wins.** While a claim is
held, exactly one caller has `Claimed` for a key, and every other gets
`AlreadyClaimed` (when a claim is released, or lapses, comes below). It's
atomic: two copies that arrive together can't both win. On Cloudflare, where
a Bynk service runs as a Worker (a small program on Cloudflare's servers),
it's a single `INSERT … ON CONFLICT` in a database, so it holds across
restarts and across the separate copies of the Worker that Cloudflare runs.

**`dedup[T](key)` and `remember[T](key, value, expiresAfter)` are a cache of
outcomes.** `remember` stores a value, and `dedup` reads it back. On their own
they're check-then-act, exactly the race above.

Together, they give a repeat the first attempt's answer without doing the
work twice: claim first, and only the winner computes and remembers. The
[`idempotency`](https://github.com/bynk-lang/showcase/tree/main/idempotency)
showcase project has one route, `POST /orders`, that does this. It first
insists on a key:

```bynk
let Some(key) = headers.get("idempotency-key") else {
	BadRequest("send an Idempotency-Key header")
}
```

then claims it. The `AlreadyClaimed` arm is where every repeat lands:

```bynk
let claimed <- Idempotency.claim(key, KeyWindow)
match claimed {
	AlreadyClaimed => {
		let earlier <- Idempotency.dedup[Answered](key)
		match earlier {
			Some(a) => if a.order == body {
				answer(a.outcome)
			} else {
				BadRequest("this Idempotency-Key was used for a different order")
			},
			None => Conflict("this order is still being placed, try again shortly"),
		}
	},
```

(`<-` runs an effect, an operation that reaches outside the function such
as a database call, and waits for its result, and `KeyWindow` is a constant
of 24 hours, so a client that retries for a day is covered.)

A repeat looks up what the first attempt remembered. If there's an answer and
the order matches, the repeat gets the same answer. If there's nothing yet,
the first attempt is still running, so the repeat is told to try again
shortly, with a `409 Conflict`. That's the "twice, at once" case, and it's
safe because only one of the two could claim the key.

The winner asks the warehouse to reserve stock, and remembers how that ended.
What it remembers is an `Answered`, which holds both the order and its
outcome:

```bynk
type Outcome =
	| Placed(reservation: String)
	| SoldOut
type Answered = {
	order: OrderRequest,
	outcome: Outcome,
}
```

Keeping the order is what lets the `AlreadyClaimed` arm compare
`a.order == body`: the same key with a different order is refused with a
`400`, rather than told that the first order went through.

Here's the winner's side, for a successful reservation:

```bynk
Ok(id) => {
	do Idempotency.remember[Answered](
		key,
		Answered {
			order: body,
			outcome: Placed(id),
		},
		KeyWindow
	)
	answer(Placed(id))
},
```

and `answer` turns an outcome into the response, the same one the first time
and every time after:

```bynk
fn answer(o: Outcome) -> HttpResult[String] {
	match o {
		Placed(reservation) => Created(reservation),
		SoldOut => Conflict("out of stock"),
	}
}
```

**The compiler settles the claim when the handler ends.** You don't write
code to give a key back, and this is where Bynk takes the "first attempt that
fails" decision out of each handler. If the handler faults, returns an `Err`,
or answers with a 5xx (`ServiceUnavailable` and the like), the claim is
released, so the client's retry is processed afresh. A 4xx or a success is a
finished answer, and the claim is kept for the whole window. So in the
showcase, out of stock (a `409`) is remembered and stays the answer, while a
warehouse outage remembers nothing and answers `503`:

```bynk
Err(WarehouseDown) => {
	do Logger.warn("warehouse down, order \(key) not placed")
	ServiceUnavailable("try again shortly")
},
```

That's the opposite choice to Stripe's saved `500`, and both are defensible:
Bynk assumes a server error is worth retrying, and lets the retry do the work.

Until it's settled, a claim is also a **30-second lease**. If the Worker is
cut off mid-request and never gets to settle, the claim lapses after 30
seconds instead of holding the key for a day, and a retry can claim it.

The tests show each rule. Two attempts with one key place one order, and the
stubbed warehouse is called once. (`returns each` answers `r-1` and then
`r-2`, so a second reservation would show up as `r-2`.)

```bynk
case "a retry gets the first answer and reserves nothing more" {
	stub Warehouse.reserve(_, _, _) returns each [Ok("r-1"), Ok("r-2")]
	let first <- orders.POST("/orders", keyed("k-1"), order()) by Visitor
	let retry <- orders.POST("/orders", keyed("k-1"), order()) by Visitor
	expect first == Created("r-1")
	expect retry == Created("r-1")
	expect Warehouse.reserve called once
}
```

And a `503` hands the key back, so the retry gets the reservation the first
attempt couldn't make:

```bynk
case "a failed attempt gives the key back for the retry" {
	stub Warehouse.reserve(_, _, _) returns each [Err(WarehouseDown), Ok("r-1")]
	let failed <- orders.POST("/orders", keyed("k-1"), order()) by Visitor
	let retry <- orders.POST("/orders", keyed("k-1"), order()) by Visitor
	expect failed is ServiceUnavailable(_)
	expect retry == Created("r-1")
	expect Logger.warn called once
}
```

## The trade-offs

- **At-most-once completion, not exactly-once side effects.** A claim makes
  the handler *finish* at most once, as long as it settles within the
  lease (see below). Work done before a failure can still
  happen again on the retry: if the warehouse reserved the stock and then the
  connection dropped, the handler answers `503`, the claim is released, and
  the retry reserves again. The fix is to pass the key along. The showcase's
  warehouse provider sends the order's key to the warehouse as its own
  `Idempotency-Key`, so the warehouse can deduplicate too.
- **A long handler can be claimed twice.** The 30-second lease that rescues a
  Worker cut off mid-request also means a handler that runs for longer than
  30 seconds can be claimed again by a retry while it's still running. When
  the first one finishes, it leaves the retry's claim alone.
- **Keys are scoped to the function, not the caller.** Keys are kept apart
  per handler, so two handlers can't collide. But every caller of one handler
  shares its keys. The showcase's route is anonymous (`by Visitor`), so a
  client must make each key unguessable: if two clients both counted from
  `1`, the second client's order would be refused, or handed the first's
  answer if the two orders matched, and never placed either way. On an authenticated route, put the
  caller's identity in the key.
- **Status codes are yours.** The draft suggests a `422` for a key reused
  with a different body; the showcase answers `400`. Bynk doesn't choose the
  responses for you, so following the draft to the letter is up to the
  handler. The showcase also answers `409` both for "still being placed, try
  again shortly" and for "out of stock", so a client can only tell the
  retryable one from the final one by reading the body.
- **One more piece of infrastructure.** On Cloudflare, claims and remembered
  values live in a D1 database (Cloudflare's SQLite service) that the build
  declares for you: `bynk deploy` creates and migrates it, and you write no
  SQL. Each call is a round trip to it. On Node and in the browser, they're
  an in-memory map, so a claim holds only within one process.
- **`remember` alone is not a guarantee.** It's easy to reach for
  `dedup` and `remember` because they read like the obvious fix, and they
  compile without a `claim`. Nothing stops you writing the check-then-act
  version; the Book and the showcase are clear that you claim first.

## See it working

The [`idempotency`](https://github.com/bynk-lang/showcase/tree/main/idempotency)
project is the order service from this post. Its tests run on an in-memory
`Idempotency` that honours each window on the test clock. Besides the retry
and the `503`, they show that an out-of-stock answer is kept even after stock
comes back, that a key reused for a different order is refused, and that
`advance Clock by 25.hours` lets the key be used afresh.

```sh
git clone https://github.com/bynk-lang/showcase
cd showcase/idempotency
bynk test .
```

To go further:

- [Deduplicate at-least-once deliveries](https://bynk-lang.org/book/guides/effects-and-capabilities/deduplicate-at-least-once-deliveries/),
  the guide in the Bynk book
- [The `Idempotency` capability](https://bynk-lang.org/reference/bynk-capabilities/#the-idempotency-capability),
  for `claim`, `dedup`, `remember` and the settling rules
- [Deploy to Cloudflare: the idempotency database](https://bynk-lang.org/book/guides/projects-build-and-deployment/deploy-to-cloudflare/#the-idempotency-database)

Back on the train, the app's retry carried the same key as the first tap.
The customer bought one sofa, and got the same receipt twice.
