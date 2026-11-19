# Inside the showcase

Each post reads one [showcase](https://github.com/bynk-lang/showcase) project
from top to bottom, to see how the pieces of a real Bynk program fit
together. *The problem with…* quotes the lines of a project that answer one
problem. This series follows the whole project: its layout, its files in the
order a reader should meet them, and its tests.

## Shape

Use these as headings.

1. **What it builds.** The project's job, in a paragraph a newcomer can
   follow, and the Bynk features it shows.
2. **The layout.** Its units (each `commons` and `context`) and how they
   depend on each other. A short list or a small diagram.
3. **A walk through the code.** File by file, in reading order. Quote the
   lines that matter and explain the decisions, not every line.
4. **The tests.** What they check, at which tier, and what that says about
   the design.
5. **Make it yours.** One or two changes the reader could try, such as adding
   a route or a new event, and what the compiler will say along the way. End
   with how to clone and run it.

## Notes for writers

- **One project per post.** Set `showcase` to that project. Quote as much of
  it as the walk-through needs: every block is checked against it.
- **Don't repeat the README.** Each project already has a walkthrough. The
  post adds the reasons: why the code is shaped this way, and what the
  alternatives would have cost.
- **Pick projects with several parts.** A project with one file is better
  quoted in another series.

## Plan

A working plan, not a promise. These are projects with several parts that
*The problem with…* doesn't plan to cover.

| # | Project | What it builds | Level | Notes |
|---|---|---|---|---|
| 1 | `events` | A checkout announces each order as an `OrderPlaced` event, and two other contexts hear it and react, without the checkout naming either | designing | Fills the plan's gap on contexts and events |
| 2 | `websocket` | Accept a WebSocket connection, authenticate it at the edge, hand it to an agent and broadcast to a room | building | |
| 3 | `queues` | A warehouse takes orders over HTTP and packs them later, through a queue and its consumer | building | Shows both ends of a queue |
| 4 | `actors-and-authorisation` | Author bios behind a small HTTP service: anyone may read, an author may write their own, a moderator may clear one | building | Who may call each route, checked at the boundary |
| 5 | `public-surface` | A library `commons` with a small public surface, brought into a `context` with `uses` | building | How a Bynk program is shaped across units |
| 6 | `storage-and-queries` | A stockroom in one agent, with a `Map`, a `Cache` and a `Log`, read through `Query[T]` | building | |
| 7 | `oidc` | A release endpoint only CI jobs from one trusted repository may call, with `Oidc` actors | designing | |
| 8 | `inbound-email` | A support desk's mailbox that accepts, rejects, forwards or replies to each message | building | Experimental: wait until it's stable, or say so plainly |
