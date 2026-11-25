# Build it with Bynk

A tutorial series. It builds one small service, *Turn up*, from an empty
folder to a live deployment, one step per post. The reader starts each post
from the previous step's code, follows numbered steps, and finishes with tests
that pass.

In [Diátaxis](https://diataxis.fr/) terms this is the blog's tutorial
quadrant. A tutorial is for learning by doing, so a post here explains only
as much as the reader needs to take the next step, and links to the series
that explain the rest: *The problem with…*, *A closer look* and *Behind the
decision*, and the Book.

"Getting started with Bynk" is the prologue. It shows a finished project (the
starter template) in half an hour; part 1 starts the reader's own.

## The project

*Turn up* is a sign-up service for small events. An organiser creates an
event with a limited number of places, people sign up over HTTP, a full event
keeps a waiting list that's promoted when someone cancels, and attendees get
an email when they're confirmed and a reminder the day before.

It's small (two contexts and a shared commons by the end), everyone
understands the domain, and it needs the parts of Bynk that the Book's own
tutorial, a URL shortener, doesn't reach: actors, events between contexts, a
capability with a provider, a schedule and idempotency. Link to the Book's
tutorial early, for readers who want the language one feature at a time.

## The code

The code lives in [`bynk-lang/turn-up`](https://github.com/bynk-lang/turn-up),
with one folder per part, each a complete project at the end of that part:

```
turn-up/
  01-an-event/
  02-open-the-doors/
  …
  09-ship-it/
```

A later part changes code an earlier part quoted, so each part keeps its own
copy. The repository's CI runs `bynk fmt --check`, `bynk check` and
`bynk test` on every folder.

A post names the folder it ends with, `repo: turn-up/03-whos-coming`
(instead of `showcase`), and `scripts/check-snippets.mjs` holds every
` ```bynk ` block to that folder's source alone, so a part can't quote a
later part's code. Each folder has its own `bynk.toml`; the repository root
needs none. Before the first post that
uses it is merged, add a checkout of `bynk-lang/turn-up` to
`.github/workflows/checks.yml` and `snippets-canary.yml`, beside the starter's,
and pass `--repo turn-up=.turn-up`.

**Code comes first.** A part's code is written and passes CI in `turn-up`
before its post is drafted, because the post quotes it. Its backlog item
stays `idea` until then, and becomes `ready` when the folder is merged.

## Shape

Use these as headings.

1. **Where we are.** The project so far, in a sentence, with a link to the
   folder this post starts from.
2. **What you'll build.** The outcome, shown as a request and its response,
   or a test that will pass.
3. **The steps.** Numbered (`### 1. Add the Gathering type`). Each says what to
   do, shows the code, then shows what you should see. No step leaves the
   project broken: the reader can run `bynk check` after every one.
4. **Check it works.** Run the tests, then try it with `bynk dev` and `curl`.
5. **What you've learned.** Three or four bullets, each linking to the post
   or Book page that explains it.
6. **Next time.** One sentence on the next part, and a link to the folder
   this post ends with.

## Notes for writers

- **Explain less than in other series.** If a paragraph explains *why* the
  language works this way, it probably belongs in a link.
- **Every step must work.** Follow the post from the starting folder and
  check the result matches the ending folder exactly, apart from files the
  post says to leave alone.
- **Name the version.** Set `bynkVersion`, and keep the folder's
  `BYNK_VERSION` (or `bynk.toml`) in step with it.
- **Experimental features.** `Email` and `Queue` are experimental: say so
  where they appear, and show the `[unstable] allow` line.
- **Names.** In prose, an *event* is the thing people sign up for. In code
  it's a `Gathering`, and the agent that holds its sign-ups is `Signups`,
  because part 6 brings Bynk's own events (messages between contexts), and
  one word mustn't mean two things in the code. Part 6 says so in a sentence.
- **Level.** `first-steps` for parts 1 to 3, `building` after that.
- **Slugs.** A part's slug is `turn-up-<part>`, so the parts sort together and
  the URL stays put if a title changes (the writing guide lists this
  exception).
- **Numbering.** The prologue is named in `SERIES` in `src/lib/ladder.ts`,
  so the series footer calls it the prologue and numbers the parts from 1.
- **Video.** A tutorial's video is mostly a screen recording of the steps,
  framed by the usual motion graphics for the title and recap.

## Plan

Each part has a backlog item in [docs/backlog/](../backlog/README.md).

| Part | Working title | What you build | Bynk features | Item |
|---|---|---|---|---|
| Prologue | Getting started with Bynk (published 31 Oct 2026) | The starter template, run, changed and deployed | the starter, `bynk test`, `bynk dev`, `bynk deploy` | |
| 1 | An event, and the rules it keeps | `bynk new`, a `Gathering` record, refined `Capacity` and `Title`, a first test | `bynk new`, records, refined types, `.of`, `suite` and `case` | [turn-up-1](../backlog/turn-up-1.md) |
| 2 | Open the doors | An HTTP service to create and read events | `from http`, `HttpResult`, decoding at the boundary, `bynk dev` | [turn-up-2](../backlog/turn-up-2.md) |
| 3 | Who's coming? | An agent per event that takes sign-ups and refuses one when full | agents, `store`, `on call`, `Result` | [turn-up-3](../backlog/turn-up-3.md) |
| 4 | Only the organiser | The organiser signs in to create events | actors, `Bearer`, `by Visitor`, `401` and `403` | [turn-up-4](../backlog/turn-up-4.md) |
| 5 | A place on the waiting list | Cancelling with a code, a waiting list, an invariant | sum types, `match`, opaque types, agent invariants | [turn-up-5](../backlog/turn-up-5.md) |
| 6 | Tell them they're in | A notifications context that hears sign-ups and sends email | contexts, events, capabilities, providers, `stub` | [turn-up-6](../backlog/turn-up-6.md) |
| 7 | See you tomorrow | A reminder the day before | `from cron`, virtual time in tests | [turn-up-7](../backlog/turn-up-7.md) |
| 8 | Tapped twice | A retried sign-up keeps one place | `Idempotency` | [turn-up-8](../backlog/turn-up-8.md) |
| 9 | Ship it | Deploy, watch and roll back | `bynk deploy`, `bynk tail`, `bynk revert` | [turn-up-9](../backlog/turn-up-9.md) |
