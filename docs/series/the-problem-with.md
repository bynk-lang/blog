# The problem with…

Each post takes a problem that bites people in practice, looks at how it is
usually handled, and explains how Bynk approaches it and what that costs. It
quotes a showcase project. Read [writing-a-post.md](../writing-a-post.md) for
the frontmatter, code rules and style that every post shares.

## Shape

Every post in the series follows the same five parts. Use them as headings.

1. **The problem.** Something that goes wrong in practice, described so a
   newcomer understands why it matters. Start from what the reader has seen,
   not from Bynk.
2. **How it's usually handled.** The conventions, libraries and discipline
   other languages rely on, and where each one stops short. Name the prior art
   (`BigDecimal`, decimal.js and so on) and treat it with respect: some
   readers use it every day.
3. **Bynk's answer.** What the language or compiler takes on, and what it
   leaves to you. Quote code from the showcase project.
4. **The trade-offs.** What the approach costs or rules out. Be specific and
   honest. This is the section that earns an experienced reader's trust.
5. **See it working.** Link the showcase project, show how to run its tests,
   and link the Book's guide and reference pages. End with one sentence that
   returns to the problem.

## Plan

A working plan, not a promise. The order mixes levels, so the first few posts
give newcomers somewhere to start, while experienced developers see early that
the series has depth. The series shares the blog's rhythm with the others (see
[the schedule](README.md#schedule)), so it doesn't need a post every time.

The **trade-offs** column notes costs the showcase READMEs already state.
Where it says *to find*, the cost still needs digging out of the Book or the
design history before the post is written.

| # | Title | Problem | Showcase | Level | Trade-offs |
|---|---|---|---|---|---|
| 1 | The problem with money | Floats drift, and rounding happens everywhere without anyone deciding it | `money` | building | More to write; no `/`; strings on the wire; no currency in the type yet. **Published 5 Nov 2026.** |
| 2 | The problem with null | A value might be missing, or an operation might fail, and nothing in the type says so | `results-and-optionals` | first-steps | No exceptions, so every failure is handled or passed on explicitly; error types must line up (`mapErr`, `embeds`); no `unwrap`. **Published 12 Nov 2026.** |
| 3 | The problem with validation | Checks are scattered, repeated or forgotten, so invalid values travel deep into the code | `refined-types`, `decode-json` | first-steps | Arithmetic on a refined value gives the base type, so results go back through `.of`; the predicates are a fixed set; one problem per decode. **Published 15 Nov 2026.** |
| 4 | The problem with webhooks | Verifying a signature by hand is easy to get subtly wrong, or to forget on one route | `verify-webhooks` | building | *To find* (for example, which signature schemes are supported) |
| 5 | The problem with at-least-once | Retries and redeliveries mean the same request can arrive twice | `idempotency` | building | A `remember` alone is check-then-act; you need `claim` first for a guarantee |
| 6 | The problem with SQL strings | Queries built from strings invite injection, and a misspelt column only fails in production | `sql-databases` | building | Every statement must be a literal; the check sees migrations, not a database that has drifted from them |
| 7 | The problem with coverage | A line can run in every test and still have nothing check its answer | `mutation-testing`, `function-contracts` | building | *To find* (for example, mutation runs take longer) |
| 8 | The problem with time in tests | Code that depends on the clock or on timing is slow, flaky or untested | `scheduled-jobs`, `concurrency`, `testing` | building | A `stub` returns a value or fails, never runs logic of its own |
| 9 | The problem with `Promise.all` | Concurrent calls fault in an order that depends on timing, and work leaks past the request | `concurrency` | designing | `race` and `within` don't cancel: the loser still runs, so only race work that is safe to do twice |
| 10 | The problem with hidden dependencies | Any function can reach the network, the clock or a secret, so tests and reviews can't see what code really touches | `capabilities-and-providers` | designing | *To find* (for example, the cost of declaring and wiring capabilities) |
| 11 | The problem with deploying two services | Change a contract between services and deploy order suddenly matters | `evolving-a-contract` | designing | A mismatched caller gets `409 ContractMismatch` until both sides line up |
| 12 | The problem with state | Shared, half-written state, and "uninitialised" as a hidden extra state | `agent-state-machine` | designing | *To find* |

## In reserve

- **The problem with translations**: a missing translation shows up as a blank
  screen rather than a build error (`localisation`). Trade-off: plural rules
  come from the host's `Intl`, not from data Bynk ships.
- **The problem with sessions**: rolling your own signed cookies
  (`signed-cookie-sessions`, `cookies`).
- **The problem with rate limits** (`rate-limiting`). Wait until the
  `RateLimit` capability is no longer experimental.

## Gaps this plan shows

- **Few first-steps posts.** Posts 2 and 3 are the only ones aimed at
  newcomers. "Getting started with Bynk", a standalone post built on the
  starter template, now gives the blog a first rung, but the series itself
  has no gentler posts left in the plan.
- **Little on designing with effects.** Posts 9–12 cover it, but contexts and
  events have no post yet. `events` could carry one.
- **Nothing for contributors yet.** That level probably needs its own series
  about how the compiler works, rather than *The problem with…*. See
  [the other series](README.md) for what else is planned.
