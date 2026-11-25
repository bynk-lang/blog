---
slug: no-unsafe
series: behind-the-decision
workingTitle: "The escape hatch we removed"
level: designing
showcase: refined-types
tags: [types, validation]
status: ready
pr:
published:
video: none
---

## Brief

For readers who liked *Check once, trust everywhere* and wondered what stops
someone minting an invalid refined value anyway. A design review called
refined `.unsafe` "the largest credibility hole in the refinement guarantee"
and recommended confining it. The reader leaves knowing why the answer was to
remove it instead, and where the hole had really been.

## Hook

Every safe type system has a way out: `unsafe`, `as`, `!`. The question
isn't whether there's a hatch, but who can reach it. A review found Bynk's
refined hatch was reachable from somewhere nobody had looked.

## Outline

### The question

- A refined type is only as trustworthy as its construction paths. If any
  code can build a `Price` without the check, every function that takes a
  `Price` has to wonder.
- The review's finding (July 2026): `.unsafe` on refined types is globally
  unrestricted. Confine it to the defining commons, as opaque `.unsafe`
  already is.

### The options

- Confine it, as the review proposed.
- Keep it, documented as the deliberate escape hatch (as §6.4 and two guides
  then described it).
- Remove it.
- Mention how other languages handle the same tension, carefully and fairly
  (for example, smart constructors in Haskell or a private constructor in
  Kotlin or Scala), checked before publishing.

### What was decided

- The investigation: in Bynk source, `Age.unsafe(-5)` was already rejected,
  everywhere, and had been since v0.62. The real hole was in the emitted
  TypeScript, where every refined type exported an `unsafe(value)` that host
  or adapter code could import.
- Record 0182: remove the hatch from refined types entirely. Literal
  admission lowers to an inline brand cast instead of a callable constructor.
  Opaque types keep `.unsafe`, confined to their own unit.
- What it looks like today: `.of` and admitted literals are the only ways in.
  Quote the `refined-types` showcase.

### What it costs

- No way to skip a check you know is redundant, such as a value just read
  back from your own database: it goes through `.of` again.
- Hand-written TypeScript bindings can't mint refined values cheaply.
- The record's own consequences section: say what it lists.

### Read the record

- Link 0182, and 0001 (the closed literal-admission set) and 0014 (refined
  ids constructed through `.of`) as its neighbours.

## Code to quote

- `refined-types` showcase: a refined type declaration with its `where`
  predicate, a `.of` call and its `Result` handling, and an admitted literal.
- A ` ```bynk nocheck ` counter-example: `Price.unsafe(…)` with the
  diagnostic it draws (`bynk.resolve.unknown_static_member`).

## Facts to check

- The record's full text: the dates, the review's wording, and the version
  the change shipped in (v0.156).
- The diagnostic for `.unsafe` on a refined type at the post's `bynkVersion`.
- Each other-language comparison against that language's documentation.

## Sources

- `design/decisions/0182-refined-no-user-unsafe.md`, 0001, 0014 in `bynk-lang/bynk`
- Book: [Refined types reference](https://bynk-lang.org/reference/refined-types/)
- Book: [Refined literal admission](https://bynk-lang.org/book/concepts/type-system/refined-literal-admission/)

## Video angle

A building with one guarded front door and a service hatch at the back. The
review points at the hatch; the investigation finds the hatch was bricked up
inside, but open from the car park (the emitted TypeScript). The decision
removes it. About 2:15.

1. Title
2. Every type system has a way out
3. The review's finding
4. Three options
5. The investigation: closed in source
6. Open in the emitted TypeScript
7. The decision: remove, not confine
8. What it costs
9. Close
