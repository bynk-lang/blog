---
slug: idempotency
series: the-problem-with
workingTitle: "The order that arrived twice"
level: building
showcase: idempotency
tags: [http, concurrency, errors]
status: ready
pr:
published:
video: none
---

## Brief

For developers building an HTTP service that takes payments or orders. A
client that never saw an answer retries, so the same order can arrive twice,
or two copies can arrive at once. The reader leaves knowing the difference
between remembering an answer and claiming a key, and why only the two
together are safe.

## Hook

A customer taps "Pay" on a train, a tunnel eats the response, and the app
tries again. Did they buy one sofa or two? Follows on from *Who really sent
this?*, whose trade-offs left deduplication to `Idempotency`, and from *The
checkout that doesn't know who's listening*, where events arrive at least
once too.

## Outline

### The problem

- At-least-once delivery is everywhere: a retried request, a redelivered
  queue message, a resent webhook.
- Two shapes of repeat: one that arrives after the first has finished, and
  two copies in flight at the same moment.
- Why "just check whether we've seen it" fails the second shape
  (check-then-act).

### How it's usually handled

- The `Idempotency-Key` request header, popularised by Stripe and now an
  IETF draft. A table of keys seen, or a unique constraint in the database.
- Where each stops short: the race between checking and recording, what a
  failed first attempt should do to the key, and a key reused with a
  different body.

### Bynk's answer

- `claim(key, expiresAfter)` is first-delivery-wins and atomic: exactly one
  caller gets `Claimed`.
- `dedup[T]` and `remember[T]` are a cache of outcomes; alone they're
  check-then-act. Claim first, and only the winner computes and remembers.
- The compiler settles the claim when the handler ends: a fault, a returned
  `Err` or a 5xx releases it so the retry is processed; a 4xx or a success
  keeps it for the window. A 30-second lease covers a Worker cut off
  mid-request.
- The remembered value carries the order, so the same key with a different
  order is refused with a `400`.

### The trade-offs

- At-most-once *completion*, not exactly-once side effects: work done before
  a failure can happen again on the retry. Pass the key along (the provider
  sends it to the warehouse as its own `Idempotency-Key`).
- Keys are scoped to the function, not the caller: an anonymous route needs
  unguessable keys, and an authenticated one should put the caller's
  identity in the key.
- On Cloudflare, claims live in a D1 database the build declares: one more
  piece of infrastructure, though you write no SQL.

### See it working

- `bynk test .` in `idempotency`, the case that advances the clock by 25
  hours, and the Book links below.
- End by returning to the sofa: one sofa, and the same receipt twice.

## Code to quote

- `src/shop/orders.bynk`: the `claim` and `dedup` match (the README quotes
  it), the winner's `remember`, and `answer`.
- `tests/shop/orders.bynk`: the retry case (`Warehouse.reserve` is `called
  once`), the `503` case that gives the key back, and `advance Clock by
  25.hours`.

## Facts to check

- The IETF draft's current name, number and status
  (draft-ietf-httpapi-idempotency-key-header).
- Stripe's key retention period and what it answers when a key is reused
  with different parameters.
- The lease length and the release rules, against the Book's `Idempotency`
  reference at the post's `bynkVersion`.

## Sources

- Book: [Deduplicate at-least-once deliveries](https://bynk-lang.org/book/guides/effects-and-capabilities/deduplicate-at-least-once-deliveries/)
- Book: [The `Idempotency` capability](https://bynk-lang.org/reference/bynk-capabilities/#the-idempotency-capability)
- Book: [Deploy to Cloudflare: the idempotency database](https://bynk-lang.org/book/guides/projects-build-and-deployment/deploy-to-cloudflare/#the-idempotency-database)
- Showcase README: `idempotency`

## Video angle

Two identical order cards fly at a turnstile: one goes through, and the
other is handed the first card's receipt. About 2:30.

1. Title
2. The tunnel and the retry
3. Twice later, or twice at once
4. The usual fixes
5. The check-then-act race, drawn as two timelines
6. `claim`: one winner
7. Claim, then remember: the receipt handed back
8. When the claim is released (fault, `Err`, 5xx) and when it's kept
9. Same key, different order: `400`
10. The trade-offs
11. Close: one sofa
