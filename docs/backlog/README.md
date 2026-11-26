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
one or two lowercase words for the topic, unique across every series. Two
series are the exception, since their posts share one topic: a *What's new*
post's slug carries the last version it covers (`whats-new-0-661`), and a
*Build it with Bynk* part's is `turn-up-<part>` (`turn-up-3`).

```markdown
---
slug: idempotency
series: the-problem-with          # leave out for a standalone post
workingTitle: "The order that arrived twice"
level: building
showcase: idempotency             # or a list
# repo: turn-up/03-whos-coming    # or a bynk-lang repository (or a folder in one), instead of showcase
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

1. [whats-new-0-661](whats-new-0-661.md): What's new in Bynk
2. [turn-up-1](turn-up-1.md): Build it with Bynk
3. [opaque-types](opaque-types.md): Coming from TypeScript
4. [turn-up-2](turn-up-2.md): Build it with Bynk
5. [queues](queues.md): Inside the showcase
6. [turn-up-3](turn-up-3.md): Build it with Bynk
7. [no-unsafe](no-unsafe.md): Behind the decision
8. [turn-up-4](turn-up-4.md): Build it with Bynk
9. [promise-all](promise-all.md): The problem with…
10. [turn-up-5](turn-up-5.md): Build it with Bynk
11. [sequence-diagrams](sequence-diagrams.md): A closer look
12. [turn-up-6](turn-up-6.md): Build it with Bynk
13. [agents](agents.md): Coming from TypeScript
14. [actors](actors.md): Inside the showcase
15. [time](time.md): The problem with…
16. [turn-up-7](turn-up-7.md): Build it with Bynk
17. [portability](portability.md): Behind the decision
18. [turn-up-8](turn-up-8.md): Build it with Bynk
19. [whats-new-next](whats-new-next.md): What's new in Bynk
20. [sql](sql.md): The problem with…
21. [turn-up-9](turn-up-9.md): Build it with Bynk
22. [websocket](websocket.md): Inside the showcase
