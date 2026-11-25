# Backlog

The posts that come next, written up and ready to draft. The
[series plans](../series/README.md) hold the longer lists of ideas; an idea
joins the backlog when it's written up here, with enough detail that a post
can be drafted from it without choosing the topic, the angle or the code
again.

The scheduled drafting task reads this folder. It takes the first item in
[the queue](#queue) whose status is `ready`, drafts the post and opens a draft
pull request. If no item is `ready`, it stops and says so: it never picks a
topic of its own.

## An item

One file per post, named after the post's slug: `docs/backlog/<slug>.md`
becomes `src/content/docs/posts/<slug>.md`, served at `/blog/posts/<slug>/`.
The slug follows [the writing guide](../writing-a-post.md#title-and-file-name):
one or two lowercase words for the topic, unique across every series.

```markdown
---
slug: at-least-once
series: the-problem-with          # leave out for a standalone post
workingTitle: "The order that arrived twice"
level: building
showcase: idempotency             # or a list
tags: [http, concurrency]         # from the fixed list in src/content.config.ts
status: ready                     # idea | ready | published
pr:                               # the draft pull request, once opened
published:                        # the post's date, once merged
video: none                       # none | storyboard | recorded
---

## Brief
## Hook
## Outline
## Code to quote
## Facts to check
## Sources
## Video angle
```

- **Brief.** Who the post is for, the problem or feature, and the one thing
  the reader leaves knowing. Three sentences or so.
- **Hook.** How the post opens: a moment from the reader's own experience.
- **Outline.** The series' headings (from its plan), with the points under
  each. The draft follows it, though a better order found while writing wins.
- **Code to quote.** The showcase files and the lines worth quoting. Every
  ` ```bynk ` block in the post is checked against them.
- **Facts to check.** Claims, about Bynk or about other tools, that need a
  source before the post goes out. The drafting pull request says how each
  was settled.
- **Sources.** The Book pages, decision records and release notes the post
  draws on.
- **Video angle.** The visual idea for the post's motion graphics video, and
  the scene beats with a rough running time. It's the starting point for the
  storyboard, not a script.

The working title names the post's point, but it's a starting point: the
draft can improve on it.

## Status

| Status | Meaning | Set by |
|---|---|---|
| `idea` | Written up, but not yet approved to draft | Whoever adds the item |
| `ready` | Approved to draft | Matthew |
| `published` | Merged; `pr` links the pull request and `published` is the post's date | The drafting pull request |

The drafting pull request changes the item itself, setting `status:
published`, `pr` and `published`, so merging it records the post. While that
pull request is open, the item still reads `ready` on `main`: the open pull
request is what marks it as taken, and the drafting task skips any item that
an open pull request already drafts.

`video` follows the post's video: `storyboard` once its storyboard and
voice-over script are done, and `recorded` once the post links its YouTube
video in `video`. When the storyboard is done, its script goes into the
item, under **Video angle**, so the repository keeps a record of it.

## Queue

In the order they should be drafted. Order is the only priority: to change
it, move a line. Keep the series mixed, as [the schedule](../series/README.md#schedule)
asks, and remove an item's line once it's published.

1. [at-least-once](at-least-once.md): The problem with…
2. [whats-new-0-661](whats-new-0-661.md): What's new in Bynk
3. [opaque-types](opaque-types.md): Coming from TypeScript
4. [queues](queues.md): Inside the showcase
5. [no-unsafe](no-unsafe.md): Behind the decision
6. [sql](sql.md): The problem with…
7. [sequence-diagrams](sequence-diagrams.md): A closer look
8. [agents](agents.md): Coming from TypeScript
9. [actors](actors.md): Inside the showcase
10. [time-in-tests](time-in-tests.md): The problem with…
11. [no-portable-infrastructure](no-portable-infrastructure.md): Behind the decision
12. [whats-new-next](whats-new-next.md): What's new in Bynk
13. [promise-all](promise-all.md): The problem with…
14. [websocket](websocket.md): Inside the showcase
