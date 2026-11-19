# A closer look

Each post explores one feature of the language or its tools in depth: what
it does, how to use it, and why it works the way it does. Where *The problem
with…* starts from a problem, this series starts from the feature, and it
suits things that are best shown rather than argued, such as the editor's
diagrams.

## Shape

Use these as headings.

1. **What it's for.** The question the feature answers, in the reader's terms:
   "What does this context depend on?", not "the component view renders a
   UML component diagram".
2. **A tour.** Use it on a real project, step by step. Quote Bynk code from
   the showcase, and show what the feature does with it.
3. **How it works.** Where its information comes from (the compiler, the
   language server, the dev server) and what that means: for example, a view
   that reads the program's model can't fall out of date with the code.
4. **Its limits.** What it doesn't do or doesn't show yet. Be as specific as
   the trade-offs in *The problem with…*.
5. **Try it.** How to open it on a showcase project, and links to the Book or
   the extension's documentation.

## Notes for writers

- **Name the version.** Tools change faster than the language. Set
  `bynkVersion`, and say in the post which version of the VS Code extension
  you used.
- **Screenshots.** Put images in `src/assets/<post-slug>/` and link them
  relatively, so Astro optimises them. Give every image alt text that says
  what it shows.
- **Code.** As in every series, each ` ```bynk ` block is quoted from the
  showcase project or projects named in `showcase`.
- **Experimental features.** If the feature is marked experimental, say so
  near the top, and expect to revisit the post.

## Plan

A working plan, not a promise. The level column says who the post is for.

| # | Title | Feature | Showcase | Level | Notes |
|---|---|---|---|---|---|
| 0 | A closer look: refined types | The whole feature: the predicates, `is`, reading a refined value, `Val` and `@example`, property tests, the editor's explorer, the emitted branded type, boundaries between contexts and the ReDoS check | `refined-types`, `money`, `capabilities-and-providers`, `testing` | building | **Published 18 Nov 2026.** Follows *The problem with validation*, and covers what #5 planned |
| 1 | A closer look: the component view | **Bynk: Show Component View**: one context as a UML component diagram, with its services, agents and providers, a provided port per service, a required port per capability or consumed service, and who calls in | `capabilities-and-providers`, `events` | designing | Fills the plan's gap on contexts. The diagram is drawn from the code, so it can't drift from it |
| 2 | A closer look: sequence diagrams and request traces | **Bynk: Show Sequence Diagram**, and the request trace laid over it while `bynk dev` runs | `concurrency` | building | The trace records each call's kind, target, location, time and outcome, never argument values |
| 3 | A closer look: agent state machines | **Bynk: Show Agent State**: the state machine generated from an agent's handlers, the handler × state table, and live instances | `agent-state-machine` | designing | Pairs with *The problem with state*; publish that first |
| 4 | A closer look: comparing two versions of a model | **Bynk: Compare Model with…**: what changed between two git refs, with compatible or breaking verdicts | `evolving-a-contract` | designing | Pairs with *The problem with deploying two services* |
| 5 | ~~A closer look: trying values on a refined type~~ | The **Try values…** explorer in a refined type's hover | `refined-types` | first-steps | Covered by *A closer look: refined types* (#0) |
| 6 | A closer look: the typed TypeScript client | `bynk client`: a client for a front end that runs the server's checks on the way out and in | `refined-types` | building | Experimental: wait until it's stable, or say so plainly |
