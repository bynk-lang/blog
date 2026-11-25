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
one or two lowercase words for the topic, unique across every series. A
*What's new* post is the exception: its slug carries the last version it
covers (`whats-new-0-661`), since every post in that series has the same
topic.

```markdown
---
slug: idempotency
series: the-problem-with          # leave out for a standalone post
workingTitle: "The order that arrived twice"
level: building
showcase: idempotency             # or a list
# repo: turn-up                   # or another bynk-lang repository, instead of showcase
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

1. [idempotency](idempotency.md): The problem with…
2. [whats-new-0-661](whats-new-0-661.md): What's new in Bynk
3. [turn-up-1](turn-up-1.md): Build it with Bynk
4. [opaque-types](opaque-types.md): Coming from TypeScript
5. [turn-up-2](turn-up-2.md): Build it with Bynk
6. [queues](queues.md): Inside the showcase
7. [turn-up-3](turn-up-3.md): Build it with Bynk
8. [no-unsafe](no-unsafe.md): Behind the decision
9. [turn-up-4](turn-up-4.md): Build it with Bynk
10. [promise-all](promise-all.md): The problem with…
11. [turn-up-5](turn-up-5.md): Build it with Bynk
12. [sequence-diagrams](sequence-diagrams.md): A closer look
13. [turn-up-6](turn-up-6.md): Build it with Bynk
14. [agents](agents.md): Coming from TypeScript
15. [actors](actors.md): Inside the showcase
16. [time](time.md): The problem with…
17. [turn-up-7](turn-up-7.md): Build it with Bynk
18. [portability](portability.md): Behind the decision
19. [turn-up-8](turn-up-8.md): Build it with Bynk
20. [whats-new-next](whats-new-next.md): What's new in Bynk
21. [sql](sql.md): The problem with…
22. [turn-up-9](turn-up-9.md): Build it with Bynk
23. [websocket](websocket.md): Inside the showcase
