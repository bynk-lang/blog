---
slug: time
series: the-problem-with
workingTitle: "Tests that wait for the clock"
level: building
showcase: [testing, scheduled-jobs, concurrency]
tags: [testing, concurrency]
status: ready
pr:
published:
video: none
---

## Brief

For developers whose test suite has a `sleep` in it, or a flaky test nobody
dares touch. Code that depends on the clock or on timing ends up slow, flaky
or untested. The reader leaves knowing three Bynk tools that make time a
value a test controls: a stubbed `Clock`, a cron handler that is given its
scheduled time, and latency stubs on virtual time.

## Hook

A seat hold should lapse after fifteen minutes. The honest test waits
fifteen minutes. Nobody runs it, so nobody notices when it breaks.

## Outline

### The problem

- Three ways time gets into code: reading the clock, running on a schedule,
  and waiting on something slow.
- What each does to tests: real waits, races that pass on a fast laptop and
  fail in CI, and the timing branches (a timeout, a tie) that go untested.

### How it's usually handled

- Fake timers (Jest's and Vitest's `useFakeTimers`, Sinon), injecting a clock
  interface, and libraries such as Java's `Clock` or Python's `freezegun`.
- Where they stop short: fake timers patch globals and can miss promises or
  library code; an injected clock is a convention someone forgets; testing a
  timeout still often means waiting for it.

### Bynk's answer

- `Clock` is a capability, so every test gets a deterministic double, and
  `stub Clock.now() returns each [...]` moves time on between calls
  (`testing`).
- A cron handler declares its scheduled fire time as a parameter, so a test
  passes the time it wants: `jobs.schedule("0 3 * * *", …)` (`scheduled-jobs`).
- Latency stubs, `returns 13 after 2.seconds`, run on virtual time: the
  harness jumps the clock to the next timer when every call in flight is
  waiting. A tie, a timeout and a call that `never` answers are all ordinary
  cases (`concurrency`).

### The trade-offs

- A `stub` returns a value or fails, never runs logic of its own, so a double
  can't model a clock that drifts.
- Virtual time only covers stubbed calls; real I/O in a `system` test runs in
  real time. Check this against the testing reference.
- The cron handler's time parameter changed type in v0.644 (an `Instant`, not
  an `Int`): say which version the post quotes.

### See it working

- `bynk test .` in each project, and how long each suite takes: seconds, with
  a fifteen-minute hold and a day-long sweep inside.
- End on the seat hold: it lapses at fifteen minutes in a test that takes
  milliseconds.

## Code to quote

- `testing/tests/holds/desk.bynk`: the `stub Clock.now() returns each […]`
  case at 14:59 and at 15:00.
- `scheduled-jobs/tests/uptime/monitor.bynk` and `sweep.bynk`:
  `jobs.schedule("*/5 * * * *", 300000)` and the nightly sweep case.
- `concurrency/tests/shop/product.bynk`: the latency stubs and the case that
  lands exactly on the deadline.

## Facts to check

- How Jest's and Vitest's fake timers handle promises and `Date`, from their
  docs, so the comparison is fair.
- How virtual time interacts with the `system` tier, from the testing
  reference.
- Whether the showcase has moved past 0.639.1, where the cron handler takes
  an `Int`.

## Sources

- Book: [Testing reference: latency and virtual time](https://bynk-lang.org/reference/testing/#stub-latency)
- Book: [Testing philosophy](https://bynk-lang.org/book/concepts/testing/philosophy/)
- Book: [Run a task on a schedule](https://bynk-lang.org/book/guides/entry-points/cron/)
- Showcase READMEs: `testing`, `scheduled-jobs`, `concurrency`

## Video angle

A wall clock in a test lab; each Bynk tool takes the clock off the wall and
puts it in the tester's hand: set it, fire it, fast-forward it. About 2:30.

1. Title
2. The fifteen-minute test nobody runs
3. Three ways time gets in
4. Fake timers and injected clocks
5. `Clock` as a capability
6. A cron handler that is told the time
7. Latency stubs on virtual time
8. A tie and a timeout, tested
9. The trade-offs
10. Close
