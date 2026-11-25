---
slug: queues
series: inside-the-showcase
workingTitle: "Take the order now, pack it later"
level: building
showcase: queues
tags: [concurrency, http, testing]
status: ready
pr:
published:
video: none
---

## Brief

For developers who have put work on a queue and wondered what happens when
the consumer can't finish it. The `queues` project is a warehouse that takes
orders over HTTP and packs them later. The reader leaves knowing both ends of
a Bynk queue, the three verdicts a consumer reaches, and when a send should
be waited for.

## Hook

"Accepted" is a promise. The route answers before any packing happens, so it
had better not promise work that never reached the queue.

## Outline

### What it builds

- One context: a route that enqueues a `PackJob`, a consumer that packs it,
  and a `Shelf` agent that holds stock.
- Features shown: `Queue` as a capability, `service … from queue`, the
  `QueueResult` verdicts, `.detach()`, and queue tests at the `system` tier.
- Say near the top that `Queue` is experimental (`[unstable] allow`).

### The layout

- `src/warehouse/packing.bynk`, and two suites: `tests/warehouse/packing.bynk`
  (in process) and `tests/warehouse/system.bynk` (the Worker's real `queue`
  entry point). A small diagram: route → queue → consumer → `Shelf`.

### A walk through the code

- `Order` (refined `Sku` and `Quantity`) versus `PackJob` (plain fields on
  purpose, so the consumer can drop a bad job rather than retry it).
- The route: `let _ <-` waits for the send; `do … .detach()` doesn't wait for
  the log line. Why each choice is right.
- The consumer: admit the job, then `Ack` or `Retry(reason)` from what the
  `Shelf` says. A verdict is separate from success or failure, so an
  impossible job is `Ack`ed to drop it.

### The tests

- `system.bynk`: a job is retried while stock is short, then `Ack`ed after a
  restock, with state carried through the case; malformed jobs are dropped;
  the HTTP boundary refuses a bad order before anything is queued.
- `packing.bynk`: recording doubles show the route sent one message and
  logged once. Nothing sent in a test reaches the consumer, which is why the
  consumer tests deliver messages themselves.

### Make it yours

- Add a `delivery { }` section with a dead-letter queue (v0.661), if the
  showcase has moved past 0.639.1; otherwise suggest a new verdict path, such
  as a job for a discontinued SKU.
- How to clone and run: `bynk test .`, `bynk dev`.

## Code to quote

- `src/warehouse/packing.bynk`: the route's send and detached log; the
  consumer's `Ack` / `Retry` branch.
- `tests/warehouse/system.bynk`: the retry-then-ack case.

## Facts to check

- Cloudflare Queues' delivery guarantee (at least once) and default retry and
  dead-letter behaviour, from the Cloudflare docs.
- What `.detach()` does with a failure ("reported instead of lost") against
  the Book's *Synchronous and asynchronous sends*.
- Whether `Queue` is still experimental at the post's `bynkVersion`.

## Sources

- Book: [Process a queued message](https://bynk-lang.org/book/guides/entry-points/queue/)
- Book: [Synchronous and asynchronous sends](https://bynk-lang.org/book/concepts/effects-and-capabilities/synchronous-and-asynchronous-sends/)
- Book: [Queue reference](https://bynk-lang.org/reference/queue/)
- Showcase README: `queues`

## Video angle

A warehouse cut-away: an order slip drops into a chute, a packer at the far
end stamps it Ack, Retry or (for a bad slip) Ack into the bin. About 2:30.

1. Title
2. "Accepted" is a promise
3. The layout: route, queue, consumer, shelf
4. Order versus PackJob
5. Waiting for the send; not waiting for the log
6. Three verdicts
7. Dropping a job that can never succeed
8. The system test: retry, restock, ack
9. Make it yours
10. Close
