---
slug: whats-new-0-661
series: whats-new
workingTitle: "What's new in Bynk: 0.639 to 0.661"
level: building
showcase: [queues, scheduled-jobs]
tags: [tooling, deployment]
status: ready
pr:
published:
video: none
---

## Brief

The series' first post, for anyone who has read the earlier posts or tried a
showcase project. It covers v0.639.2 to v0.661.1 (released 24 Nov 2026), the
span since the version the first posts were written against. The reader
leaves knowing the handful of changes they'd notice, and exactly what to
change in their code when they upgrade.

## Hook

Bynk doesn't have big releases: every merge is a version, and this span is
more than 180 increments. Here are the dozen you'd notice. Say in the first
paragraph which versions the post covers, as the series plan asks.

## Outline

### The headline

- `CallOutcome` (v0.656.0): `<context>.<service>.outcome(args)` returns
  `Handled`, `Rejected`, `Faulted` or `Unreachable`, so a caller can handle a
  failed cross-context call instead of faulting. Links back to *The checkout
  that doesn't know who's listening*.
- Queue delivery settings (v0.661.0): a `delivery { }` section sets retries,
  retry delay, dead-letter queue, batching and concurrency; `bynk deploy`
  creates the dead-letter queue, and a consumer without one now warns
  (`bynk.queue.no_dead_letter`).

### What changed

- **Language:** `List`, `Map` and `Set` gained methods, and `bynk.list`,
  `bynk.map` and `bynk.set` are deprecated (v0.643, v0.648); `Duration`
  literals take the singular with `1` (v0.651); `String` length counts code
  points (v0.647); regexes run in Unicode mode (v0.660).
- **HTTP:** routes are tried in a defined order, and an unreachable route is
  an error (v0.659); a JSON route answers `415` to other media types (v0.654);
  malformed percent-encoding is a `400` (v0.655.1).
- **Cron:** the schedule is checked against Cloudflare's syntax (v0.652), can
  be a named constant (v0.653) and can be a handler parameter (v0.655); a
  failed run is marked failed in Cron Past Events (v0.658).
- **Testing:** a consumed context's service is a `stub` seam at `unit` and
  `integration` (v0.649).
- **Actors:** a refinement over `Caller` admits named calling contexts
  (v0.650).

### If you're upgrading

- A cron handler's scheduled time is an `Instant`, not an `Int` (v0.644).
- An `on call` handler must name its actor, `by Caller` at least (v0.642);
  `bynk check --fix=bynk.actor.missing_by_on_call` adds it.
- `List.parTraverse` now returns the steps' values; the old unit-returning
  form is `parForEach` (v0.646).
- `*`, `{` and `}` are reserved in route paths (v0.640).
- Check the Book's Upgrading page for anything else in the span.

### Behind the decisions

- One change from its record: the route-matching order (0914) or
  `CallOutcome` (0910/0944). Pick whichever record tells the better story.

### Try it

- How to upgrade (the Install page), and the showcase projects that show the
  new features once the showcase moves past 0.639.1.

## Code to quote

The showcase is pinned at 0.639.1 (`BYNK_VERSION`), so it can't show these
changes yet. Check whether it has moved before drafting. If not, use
` ```bynk nocheck ` blocks sparingly, as the series plan allows, and say so in
the pull request.

## Facts to check

- The exact span: the first version after 0.639.1 and the last released
  version on the day the post is drafted.
- Every version number above against the release pages.
- Every breaking change against the Book's Upgrading page.

## Sources

- Release pages: [v0.655.0](https://bynk-lang.org/reference/releases/v0-655-0/) and [v0.661.1](https://bynk-lang.org/reference/releases/v0-661-1/)
- Book: [Upgrading](https://bynk-lang.org/reference/upgrading/)
- Decision records 0910, 0914, 0916, 0944 in `bynk-lang/bynk`
- The VS Code extension's `CHANGELOG.md`

## Video angle

A version counter spins from 0.639 to 0.661 while changes drop onto a
workbench, sorted into three trays: language, tools, platform. About 2:00.

1. Title
2. Bynk doesn't have big releases
3. Headline: `CallOutcome`
4. Headline: queue delivery and dead letters
5. The language tray
6. The tools tray
7. The platform tray
8. If you're upgrading: the checklist
9. Close
