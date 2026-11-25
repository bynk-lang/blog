# Behind the decision

Each post tells the story of one design decision, from its record in
[`design/decisions/`](https://github.com/bynk-lang/bynk/tree/main/design/decisions)
in `bynk-lang/bynk`. Bynk has hundreds of these records, and each says what
the question was, what else was considered and why one answer won. The blog
explains the thinking behind Bynk, and this series is that thinking at its
most direct.

## Shape

Use these as headings.

1. **The question.** What had to be decided, and why it mattered, in terms a
   developer who has never designed a language can follow. Start from code
   the reader might write.
2. **The options.** Each serious alternative, stated fairly, with what it
   would have bought. Other languages' answers belong here, named and treated
   with respect.
3. **What was decided.** The decision, the reasons the record gives, and
   what it looks like in Bynk code today, quoted from the showcase.
4. **What it costs.** What the decision rules out or makes harder, and
   whether the record leaves room to revisit it.
5. **Read the record.** A link to the record, and to the Book pages that
   describe the result.

## Notes for writers

- **The record is the source.** Quote it where its wording is good, and
  don't claim reasons it doesn't give. Where a later record amends or
  supersedes it, follow the chain and say so.
- **Records are terse and full of internal references** (spec sections,
  issue numbers, track names). Translate them; link the record for readers who
  want the original.
- **Code.** Quote the showcase where it shows the result. A counter-example
  (code the decision forbids) is a ` ```bynk nocheck ` block, and the prose
  says why it doesn't compile.
- **Level.** Usually `designing`, or `contributing` for a decision about the
  compiler itself.

## Plan

A working plan, not a promise. Items with a backlog file are written up in
[docs/backlog/](../backlog/README.md).

| # | Record | The question | Showcase | Level | Notes |
|---|---|---|---|---|---|
| 1 | 0182 | Should a refined type have an unchecked escape hatch? | `refined-types` | designing | Backlog: [no-unsafe](../backlog/no-unsafe.md) |
| 2 | 0016 | Should Bynk offer portable storage over every platform? | `files-in-r2`, `postgres` | designing | Backlog: [no-portable-infrastructure](../backlog/no-portable-infrastructure.md) |
| 3 | 0041 | Should `Int` widen to `Float` on its own? | `money` | building | Named, lossy conversions and no ambiguous `toInt` |
| 4 | 0082 | Must every HTTP route say who may call it? | `actors-and-authorisation` | designing | Why HTTP has no default actor when cron and queues do |
| 5 | 0691 | Should `race` cancel the loser? | `concurrency` | designing | Write after *The problem with `Promise.all`*, or fold into it |
| 6 | The positioning record (`design/bynk-positioning.md`) | One identity: a production language, not a teaching language | none | contributing | A strategy record, not in `decisions/`: a standalone post may suit it better |
