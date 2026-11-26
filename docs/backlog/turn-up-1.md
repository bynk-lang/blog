---
slug: turn-up-1
series: build-it
workingTitle: "An event, and the rules it keeps"
level: first-steps
repo: turn-up/01-an-event
tags: [getting-started, types, validation]
status: idea                      # ready once 01-an-event/ is merged in bynk-lang/turn-up
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

1. `bynk new turn-up`, and a tour of what it made (`bynk.toml`, `src/`,
   `tests/`). Run `bynk test` on the empty project.
2. A commons for the domain, and `type Capacity = Int where …` (1 to 500).
3. `type Title = String where …` (a length range).
4. The `Gathering` record (an event, in the reader's words; see the naming note in the series plan): title, capacity, start time (an `Instant`).
5. Make one with `.of`, and read the `Result`.
6. A suite with three cases: a good event, a capacity of 0, a capacity of 501.
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

- `01-an-event/`: the refined types, the `Gathering` record, and the test suite.
  The code is written first; see the series plan.

## Facts to check

- What `bynk new` generates at the post's `bynkVersion` (the Book's *Start a
  new project* guide), and whether it makes a context, a commons or both.
- The exact predicate syntax for a length range and a numeric range.
- The diagnostic for a literal that fails admission.

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
