# Series and schedule

The blog publishes in a few series, each with its own shape, plus the odd
post that stands on its own. This folder holds a plan for each series.
[writing-a-post.md](../writing-a-post.md) covers what every post shares: the
frontmatter, the code rules and the style.

| Series | `series` id | What a post does | Plan |
|---|---|---|---|
| The problem with… | `the-problem-with` | Takes one problem, how it's usually handled, Bynk's answer and its costs | [the-problem-with.md](the-problem-with.md) |
| A closer look | `a-closer-look` | Explores one feature of the language or its tools in depth | [a-closer-look.md](a-closer-look.md) |
| Inside the showcase | `inside-the-showcase` | Reads one showcase project from top to bottom | [inside-the-showcase.md](inside-the-showcase.md) |
| What's new in Bynk | `whats-new` | Looks back over recent releases | [whats-new.md](whats-new.md) |

A post with no `series` stands alone, as "Getting started with Bynk" does.

## Schedule

A post goes out every **three, five or seven days**. Varying the gap keeps
the rhythm from feeling mechanical, and the longer gaps leave room for a post
that needs more research. Mix the series: try not to publish two posts from
the same series in a row while another series has one ready.

`date` in a post's frontmatter is its publication date, and a finished post
can be merged ahead of it. Until its date, a post is treated as a draft: a
production build leaves it out, and `npm run dev` shows it with a draft badge.
The site is rebuilt every morning (05:17 UTC), so the post appears on its
date without another commit. Keep `draft: true` for a post that isn't
finished, whatever its date.

The first four posts were backdated when the blog launched, so it opened with
some content.

| Date | Post | Series | Gap |
|---|---|---|---|
| 31 Oct 2026 | Getting started with Bynk | none | |
| 5 Nov 2026 | The problem with money | The problem with… | 5 days |
| 12 Nov 2026 | The problem with null | The problem with… | 7 days |
| 15 Nov 2026 | The problem with validation | The problem with… | 3 days |

The next post is due three, five or seven days after the last one in the
table above. Add each post to the table when it's published.

A suggested order for the next few, to vary the series. Each plan has the
detail.

1. A closer look: the component view
2. The problem with webhooks
3. Inside the showcase: events
4. The problem with at-least-once
5. What's new in Bynk (covering the versions since 0.639.1)

## Adding a series

1. Add its id to `series` in [`src/content.config.ts`](../../src/content.config.ts),
   so a post's frontmatter can name it.
2. Add its title and a one-sentence blurb to `SERIES` in
   [`src/lib/ladder.ts`](../../src/lib/ladder.ts). The home page shows the
   series, in that order, once it has a published post.
3. Write its plan here: what a post in it does, its shape (the headings every
   post uses), and a list of candidate posts.
4. Add it to the table above.
