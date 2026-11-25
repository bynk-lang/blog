# Coming from TypeScript

Each post takes one thing a TypeScript or Cloudflare Workers developer already
writes by hand, and shows what Bynk declares instead. Bynk compiles to
TypeScript and runs on Workers, so these readers are the closest to it: the
post meets them where they are, and shows them the TypeScript the compiler
writes for them.

The Book's [Coming from TypeScript](https://bynk-lang.org/book/introduction/coming-from-typescript/)
page has a translation table of eleven rows. A post here takes one row and
does it justice.

## Shape

Use these as headings.

1. **What you'd write today.** The TypeScript the reader already knows, short
   and fair: the idiom done well, not a strawman. Say what it gets right.
2. **What Bynk declares instead.** The Bynk version, quoted from the
   showcase, and what the declaration means.
3. **What the compiler emits.** The TypeScript Bynk generates for it (from
   `bynk build`, or **Bynk: Show Compiled Output** in VS Code), so the reader
   sees there's no magic. Quote the part that matters, not the whole file.
4. **What you give up.** The flexibility, libraries or habits the reader
   loses, as specifically as the trade-offs in *The problem with…*.
5. **Try it.** The showcase project to clone, and the Book pages to read
   next.

## Notes for writers

- **Respect the reader's TypeScript.** They write it every day, and many will
  know it better than the post does. Check every TypeScript claim against the
  TypeScript handbook or the Workers documentation, and name the TypeScript
  version where it matters.
- **Emitted TypeScript isn't checked by CI.** Paste it in a ` ```ts ` block
  from a real build of the showcase project at the post's `bynkVersion`, and
  say in the pull request how you produced it.
- **Don't re-run older posts.** Validation (`.of` instead of Zod) and errors as
  values have posts of their own: link to them rather than repeating them.
- **Level.** Usually `first-steps` or `building`.

## Plan

A working plan, not a promise. Items with a backlog file are written up in
[docs/backlog/](../backlog/README.md).

| # | Row of the translation table | Showcase | Level | Notes |
|---|---|---|---|---|
| 1 | Hand-rolled branded types → **opaque types** | `websocket` | first-steps | Backlog: [opaque-types](../backlog/opaque-types.md) |
| 2 | A hand-written Durable Object class → an **agent** | `storage-and-queries` | building | Backlog: [agents](../backlog/agents.md) |
| 3 | Dependencies wired by hand or with decorators → **capabilities** and **providers** | `capabilities-and-providers` | building | Pairs with *The problem with hidden dependencies*: write one, link the other |
| 4 | A Worker `fetch` handler and a router → a **`from http` service** | `serve-a-page`, `forms` | first-steps | Route order (v0.659) and typed path parameters are worth showing |
| 5 | A discriminated union and a `switch` with no `default` → a **sum type** and an exhaustive **`match`** | `pattern-matching` | first-steps | |

Already covered elsewhere: validating with Zod (*Check once, trust
everywhere*) and `throw` versus `Result` (*Missing isn't the same as wrong*).
