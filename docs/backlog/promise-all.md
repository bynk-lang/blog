---
slug: promise-all
series: the-problem-with
workingTitle: "Which failure did you get?"
level: designing
showcase: concurrency
tags: [concurrency, errors]
status: ready
pr:
published:
video: none
---

## Brief

For developers who run independent calls at once with `Promise.all`,
`Promise.any` or `Promise.race`. When one of them fails, which error you see
depends on timing, and the others keep running after the handler has
answered. The reader leaves knowing what `par`, `race` and `within` promise,
including the thing they deliberately don't do: cancel.

## Hook

A product page fetches stock, price and delivery at once. Twice in a week it
fails, with two different errors, from the same bad deploy. Which one was
real? Both, and the order was luck.

## Outline

### The problem

- Three slow lookups in a row cost the sum of their latencies, so we run them
  together.
- `Promise.all` rejects with the first failure *to happen*, so the error
  depends on timing. The other promises keep running, and on a Worker their
  results go nowhere.
- `Promise.race` settles on the first to finish, even a fast failure, which
  is the opposite of what a hedged read wants.

### How it's usually handled

- `Promise.allSettled` and `Promise.any`, `AbortController` and signals,
  structured concurrency (Kotlin coroutines, Swift task groups, Java's
  structured concurrency preview, Python's `TaskGroup`).
- Credit structured concurrency: Bynk shares its goal that nothing outlives
  its scope. Where JavaScript stops short: cancellation is cooperative and
  opt-in, and a Worker's `waitUntil` adds its own rules.

### Bynk's answer

- `par { … }` waits for every branch, even after one faults, then raises the
  first fault in *source* order, with the rest attached as suppressed.
  Nothing it starts outlives the handler.
- `a.race(b)` takes the first to *succeed*; a fast fault doesn't win.
- `e.within(d)` gives `Err(TimedOut)` if the deadline passes first.
- Neither `race` nor `within` cancels. The loser is handed to `waitUntil` and
  runs to completion, because cancelling a Worker's promise could leave a
  write half done (record 0691, and 0687 for `within`).

### The trade-offs

- No cancellation: race only work that is safe to do twice, and read
  `TimedOut` as "I didn't wait to find out", not "nothing happened".
- `par`'s bindings can't use each other's results.
- No `race` over a list yet (a `raceAll` is a possible follow-up, per 0691).

### See it working

- `bynk test .` in `concurrency`: a fast fault losing the race, a courier that
  `never` answers, and a tie on the deadline, all on virtual time.
- End on the product page: the same error every time, the one first in the
  code.

## Code to quote

- `concurrency/src/shop/product.bynk`: `fastestPrice`, the `within` match in
  `deliveryNote`, and the `par` block.
- `concurrency/tests/shop/product.bynk`: the latency stubs and the case
  where a branch of the join faults (`expect page.call(7) faults`).

## Facts to check

- The exact semantics of `Promise.all`, `allSettled`, `any` and `race` (MDN).
- Cloudflare's `waitUntil` limits, from the Workers docs.
- The state of structured concurrency in Java (preview or final) at the time
  of writing.
- Records 0687 and 0691, and the concurrent-effects track's option (c), real
  cancellation, described as a non-goal.

## Sources

- Book: [Run independent calls at the same time](https://bynk-lang.org/book/guides/effects-and-capabilities/run-independent-calls-at-the-same-time/)
- Book: [Ask two sources and take the first answer](https://bynk-lang.org/book/guides/effects-and-capabilities/ask-two-sources-and-take-the-first-answer/)
- Book: [Bound how long a call may take](https://bynk-lang.org/book/guides/effects-and-capabilities/bound-how-long-a-call-may-take/)
- Book: [What a join guarantees on failure](https://bynk-lang.org/book/concepts/effects-and-capabilities/what-a-join-guarantees-on-failure/)
- Book: [What a timeout stops](https://bynk-lang.org/book/concepts/effects-and-capabilities/what-a-timeout-stops/)
- Decision records 0687 and 0691 in `bynk-lang/bynk`
- Showcase README: `concurrency`

## Video angle

Three runners leave together; with `Promise.all` the first to trip ends the
race and the others run off screen. With `par`, everyone finishes, and the
judge reads the faults in lane order. Then a relay where the loser keeps
running in grey after the whistle. About 2:45.

1. Title
2. Two different errors from one bug
3. Why we run calls together
4. `Promise.all`: the first failure to happen
5. Work that outlives the request
6. `par`: wait for all, first fault in source order
7. `race`: first to succeed
8. `within`: a deadline
9. Why nothing is cancelled
10. The trade-offs
11. Close
