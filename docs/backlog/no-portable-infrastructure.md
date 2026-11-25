---
slug: no-portable-infrastructure
series: behind-the-decision
workingTitle: "Why Bynk doesn't hide Cloudflare"
level: designing
showcase: [files-in-r2, postgres]
tags: [capabilities, deployment]
status: ready
pr:
published:
video: none
---

## Brief

For architects who have been told to keep their code "cloud-agnostic". An
early Bynk draft proposed a portable key-value store over Cloudflare KV,
DynamoDB and the rest. Record 0016 dropped it. The reader leaves knowing why
a portable layer can lie about what's underneath, and how Bynk makes a
project's platform commitment visible instead.

## Hook

Every portable storage layer promises that you can switch clouds later. Few
teams ever do, and all of them pay for the promise in the meantime: in
features they can't use, and in guarantees that differ from one backend to
the next.

## Outline

### The question

- Should Bynk offer storage that works the same on every platform, with the
  platform chosen at deploy time?

### The options

- The interim draft: a portable `bynk.Kv` with selectable providers (a
  three-tier design, superseded).
- Embrace each platform as it is, with honest platform-shaped capabilities.
- Point to how others approach it (for example, ORMs over several databases,
  or multi-cloud abstraction libraries), fairly and checked.

### What was decided

- Capabilities split two ways: ambient primitives that are the same
  everywhere (the `bynk` surface: `Clock`, `Logger`, `Fetch`), and
  infrastructure whose semantics differ enough that a portable layer would
  lie, provided by platform adapters such as `bynk.cloudflare`.
- A project's platform commitment is one greppable `consumes` line:
  `consumes bynk.cloudflare { R2 }`.
- Portability where a project really needs it is a user-written adapter over
  the platform adapters, choosing that project's own lowest common
  denominator.

### What it costs

- Moving platforms means rewriting the infrastructure edges, by design.
- No selectable-provider mechanism; the record lists what else goes.
- Record 0017 (one platform lock per deployment unit) follows from it: check
  it and mention it if it's relevant.

### Read the record

- Link 0016, 0017 and the platform adapters reference.

## Code to quote

- `files-in-r2/src/vault/files.bynk`: `consumes bynk.cloudflare { R2 }` and
  `capability Archives = R2`.
- `postgres/src/depot/stock.bynk`: its `consumes bynk.cloudflare { Postgres, … }`
  line, to show the same pattern for a database.

## Facts to check

- The full text of 0016 and 0017, and what "v0.17" was.
- Whether `Postgres` is reached through Cloudflare (Hyperdrive) in the
  showcase, so the post describes it correctly.
- Any comparison with other tools against their documentation.

## Sources

- `design/decisions/0016-no-portable-infrastructure.md` and
  `0017-platform-lock-per-deployment-unit.md` in `bynk-lang/bynk`
- Book: [Adapters reference](https://bynk-lang.org/reference/adapters/)
- Book: [Why compile to TypeScript](https://bynk-lang.org/book/concepts/projects-build-and-deployment/why-compile-to-typescript/)
- Showcase READMEs: `files-in-r2`, `postgres`

## Video angle

A universal travel adaptor fits every socket but carries the lowest voltage;
beside it, a labelled plug for each socket, and one line on the wall saying
which socket this house uses. About 2:00.

1. Title
2. The cloud-agnostic promise
3. The draft: a portable `Kv`
4. Why it would lie
5. Two kinds of capability
6. One greppable line
7. Portability, if you need it, is yours
8. What it costs
9. Close
