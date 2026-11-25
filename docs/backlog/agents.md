---
slug: agents
series: from-typescript
workingTitle: "Your Durable Object, declared"
level: building
showcase: storage-and-queries
tags: [agents, data]
status: ready
pr:
published:
video: none
---

## Brief

For Cloudflare developers who have written a Durable Object class by hand:
the constructor, `state.storage.get` and `put`, the alarm that sweeps expired
entries, the second key that serves as an index. In Bynk, an agent declares
the state and the runtime does the bookkeeping. The reader leaves knowing how
an agent maps to a Durable Object, and what `@indexed`, `@ttl` and `@retain`
replace.

## Hook

A Durable Object for a shop's stockroom starts as forty lines. By the time it
has an index by aisle, holds that lapse after fifteen minutes and a delivery
log trimmed to thirty days, it's three hundred, and half of them are
housekeeping.

## Outline

### What you'd write today

- A Durable Object class: `fetch` or RPC methods, `this.ctx.storage`, a
  hand-kept index, an alarm for expiry, and care with `blockConcurrencyWhile`
  or transactions. Fair: Durable Objects are a fine primitive, and the
  storage API is small.
- Keep it short; one representative method and the alarm are enough.

### What Bynk declares instead

- `agent Stockroom` with a key (one Durable Object per `branch`) and three
  `store` fields: a `Map` `@indexed(by: aisle)`, a `Cache` `@ttl(15.minutes)`
  and a `Log` `@retain(30.days)`.
- `on call` handlers; writes commit atomically when the handler returns.
- `Query[T]`: `filter`, `sortBy`, `collect`, `sum` and `groupBy`, the same
  vocabulary a `List` has. An equality filter on the indexed field becomes a
  lookup without changing the query.

### What the compiler emits

- The Durable Object class Bynk generates for `Stockroom`, and the
  `wrangler.toml` binding. Quote the part that shows the index or the expiry
  being maintained in the commit.

### What you give up

- The storage kinds are a fixed set: no custom storage layout.
- Find the costs from the Book's agent model and the agent reference (for
  example, an agent that is busy answers `503`, per record 0930), and state
  them plainly.
- You can't hand-tune the storage calls the runtime makes.

### Try it

- Clone the showcase, run `storage-and-queries`'s tests, and add a query.
  Link *The agent model* and the agents reference.

## Code to quote

- `storage-and-queries/src/stockroom/shop.bynk`: the agent's key and its three
  `store` fields; `aisle` (the indexed filter); `byAisle` (`groupBy`); `hold`
  (a `Cache` op with `given Clock`).

## Facts to check

- The Durable Objects storage API as it stands (the SQLite-backed storage and
  its `sql` API, the KV-style API, alarms), from the Cloudflare docs.
- How Bynk maps an agent's storage onto Durable Object storage, from the
  emitted code at the post's `bynkVersion`.
- How `@ttl` expiry and `@retain` trimming actually happen (on access, on
  commit, or by alarm), from the Book.

## Sources

- Book: [The agent model](https://bynk-lang.org/book/concepts/agents-and-state/the-agent-model/)
- Book: [Agents reference](https://bynk-lang.org/reference/agents/)
- Book: [Coming from TypeScript](https://bynk-lang.org/book/introduction/coming-from-typescript/)
- Decision record 0930 (an agent that is busy answers `503`)
- Showcase README: `storage-and-queries`

## Video angle

A long scroll of hand-written class code shrinks, line by line, into three
`store` declarations; each annotation lights up the housekeeping it replaced
(an index table, a sweeper, a trimmer). About 2:15.

1. Title
2. The Durable Object you'd write
3. Where the lines go: housekeeping
4. `agent Stockroom`
5. `@indexed`: the index you didn't write
6. `@ttl`: the sweeper you didn't write
7. `@retain`: the trimmer you didn't write
8. Queries
9. What the compiler emits
10. What you give up
11. Close
