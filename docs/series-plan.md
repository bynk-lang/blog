# The Problem With… — series plan

A working plan for the series, not a promise. Each post takes one problem,
follows the five-part shape in [writing-a-post.md](writing-a-post.md), and
quotes a showcase project.

The order mixes levels, so the first few posts give newcomers somewhere to
start, while experienced developers see early that the series has depth. One
post a fortnight is a sustainable pace.

The **trade-offs** column notes costs the showcase READMEs already state.
Where it says *to find*, the cost still needs digging out of the Book or the
design history before the post is written.

| # | Title | Problem | Showcase | Level | Trade-offs |
|---|---|---|---|---|---|
| 1 | The Problem With Money | Floats drift, and rounding happens everywhere without anyone deciding it | `money` | building | More to write; no `/`; strings on the wire; no currency in the type yet. **Written.** |
| 2 | The Problem With Null | A value might be missing, or an operation might fail, and nothing in the type says so | `results-and-optionals` | first-steps | No exceptions, so every failure is handled or passed on explicitly; error types must line up (`mapErr`, `embeds`); no `unwrap`. **Drafted.** |
| 3 | The Problem With Validation | Checks are scattered, repeated or forgotten, so invalid values travel deep into the code | `refined-types`, `decode-json` | first-steps | Arithmetic on a refined value gives the base type, so results go back through `.of` |
| 4 | The Problem With Webhooks | Verifying a signature by hand is easy to get subtly wrong, or to forget on one route | `verify-webhooks` | building | *To find* (for example, which signature schemes are supported) |
| 5 | The Problem With At-Least-Once | Retries and redeliveries mean the same request can arrive twice | `idempotency` | building | A `remember` alone is check-then-act; you need `claim` first for a guarantee |
| 6 | The Problem With SQL Strings | Queries built from strings invite injection, and a misspelt column only fails in production | `sql-databases` | building | Every statement must be a literal; the check sees migrations, not a database that has drifted from them |
| 7 | The Problem With Coverage | A line can run in every test and still have nothing check its answer | `mutation-testing`, `function-contracts` | building | *To find* (for example, mutation runs take longer) |
| 8 | The Problem With Time in Tests | Code that depends on the clock or on timing is slow, flaky or untested | `scheduled-jobs`, `concurrency`, `testing` | building | A `stub` returns a value or fails, never runs logic of its own |
| 9 | The Problem With `Promise.all` | Concurrent calls fault in an order that depends on timing, and work leaks past the request | `concurrency` | designing | `race` and `within` don't cancel: the loser still runs, so only race work that is safe to do twice |
| 10 | The Problem With Hidden Dependencies | Any function can reach the network, the clock or a secret, so tests and reviews can't see what code really touches | `capabilities-and-providers` | designing | *To find* (for example, the cost of declaring and wiring capabilities) |
| 11 | The Problem With Deploying Two Services | Change a contract between services and deploy order suddenly matters | `evolving-a-contract` | designing | A mismatched caller gets `409 ContractMismatch` until both sides line up |
| 12 | The Problem With State | Shared, half-written state, and "uninitialised" as a hidden extra state | `agent-state-machine` | designing | *To find* |

## In reserve

- **The Problem With Translations**: a missing translation shows up as a blank
  screen rather than a build error (`localisation`). Trade-off: plural rules
  come from the host's `Intl`, not from data Bynk ships.
- **The Problem With Sessions**: rolling your own signed cookies
  (`signed-cookie-sessions`, `cookies`).
- **The Problem With Rate Limits** (`rate-limiting`). Wait until the
  `RateLimit` capability is no longer experimental.

## Gaps this plan shows

- **Few first-steps posts.** Posts 2 and 3 are the only ones aimed at
  newcomers, partly because the showcase has no "start here" project. A
  gentle first project would give the series a better first rung.
- **Little on designing with effects.** Posts 9–12 cover it, but contexts and
  events have no post yet. `events` could carry one.
- **Nothing for contributors yet.** That level probably needs its own series
  about how the compiler works, rather than *The Problem With…*.
