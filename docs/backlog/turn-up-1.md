---
slug: turn-up-1
series: build-it
workingTitle: "An event, and the rules it keeps"
level: first-steps
repo: turn-up/01-an-event
tags: [getting-started, types, validation]
status: ready                     # 01-an-event/ merged in bynk-lang/turn-up#1
pr:
published:
video: none
---

## Brief

For readers who have finished *Getting started* and want to build their own
service. Part 1 starts *Turn up* from an empty folder: `bynk new`, the `Gathering`
record, and the rules an event keeps, written as refined types and checked by
a first test. The reader leaves with a project that compiles and a test that
passes, and knows how a rule on a type differs from a check in a function.

## Hook

An event needs a title and a number of places. "Fifty places" is fine; "minus
three places" and "a hundred thousand places" are not. Where should that rule
live?

## Outline

### Where we are

- Nothing yet. Link the prologue, and the Book's tutorial for readers who want
  the language one feature at a time. Introduce *Turn up* in a paragraph, and
  show where the series is going (the parts table, briefly).

### What you'll build

- A project with a `Gathering` type that can't hold an impossible capacity, and
  a test that proves it.

### The steps

1. `bynk new turn-up --name turnup`, and a tour of what it made (`bynk.toml`,
   `.gitignore`, `src/turnup.bynk`, a "hello" HTTP service left alone until
   part 2). Plain `bynk new turn-up` fails: a dash isn't legal in a Bynk name,
   so show the error and the `--name` fix. Run `bynk test` ("no tests found").
   If the reader uses git, have them add `/out` to `.gitignore`: `bynk check`
   writes compiled TypeScript there and the scaffold doesn't ignore it
   (bynk-lang/bynk#4361; drop this if a release fixes it).
2. A commons for the domain, and `type Capacity = Int where …` (1 to 500).
3. `type Title = String where …` (a length range).
4. The `Gathering` record (an event, in the reader's words; see the naming note in the series plan): title, capacity, start time (an `Instant`).
5. Make one with `.of`, and read the `Result`.
6. A suite (`tests/gatherings.bynk`) with the folder's six cases: a good
   gathering, a capacity of 0, a capacity of 501, both bounds (1 and 500), a
   title that's too short, and `smallRoom()`. Its start time comes from a
   helper `fn opening()`, since a suite can't hold a `let`.
7. Try a literal that breaks the rule, and read the compile error (literal
   admission).

### Check it works

- `bynk check` and `bynk test`.

### What you've learned

- Records and refined types; `.of` returns a `Result`; literals are checked at
  compile time. Link *Check once, trust everywhere* and the refined types
  reference.

### Next time

- Part 2 puts an HTTP service in front.

## Code to quote

- `01-an-event/` (bynk-lang/turn-up#1, Bynk v0.655.0):
  - `src/gatherings.bynk`: `commons gatherings` with `Capacity`
    (`InRange(1, 500)`), `Title` (`MinLength(3) && MaxLength(80)`), the
    `Gathering` record, `gathering(title, capacity, startsAt)` built with `.of`
    and `?`, and `smallRoom()`, a literal `Capacity`.
  - `tests/gatherings.bynk`: six cases, including both bounds and a short title.
  - Changing `smallRoom()`'s `12` to `0` gives
    ``[bynk.refine.literal_violates] literal 0 does not satisfy `InRange` required by type `Capacity` ``.
    Show that error in step 7, and set `bynkVersion: 0.655.0`.

## Facts to check

Checked against v0.655.0 and recorded above: what `bynk new` generates (a
context with one HTTP service, no commons), the predicate syntax, and the
literal-admission diagnostic. If the post's `bynkVersion` moves past 0.655.0,
check them again.

## Sources

- Book: [Start a new project with `bynk new`](https://bynk-lang.org/book/guides/projects-build-and-deployment/start-a-project/)
- Book: [Make illegal states unrepresentable](https://bynk-lang.org/book/tutorials/refined-types/)
- Book: [Refined types reference](https://bynk-lang.org/reference/refined-types/)

## Video angle

Screen recording of the steps, framed by a title card and a recap. A ruler
graphic for `Capacity`: values slide onto it and the out-of-range ones fall
off. About 4:00.

First encounters (see the series plan's
[First encounters](../series/build-it.md#first-encounters)): the video pauses
for the new syntax, `commons` (before the first line of `src/gatherings.bynk`
is typed), `---` (when the docs are added, after the types exist) and `where`
(when `Capacity` is refined). The narration explains each one's purpose before
it's typed. Records, `.of` and `Result`, `suite` and `case`, and literal
admission are covered by the narration as they happen, with no separate pause.
The storyboard tells it as a problem and its fix: a naive `Gathering` with
`String` and `Int` first, what that still allows, then the refined types.
