# Writing a post

The blog explains the thinking behind Bynk. Posts don't repeat the Book or a
showcase README: they say why the language works the way it does, then send
the reader to the code.

## Series and shapes

Most posts belong to a series, and each series has its own shape: a set of
headings every post in it follows, so a reader knows what to expect. The
shapes, and the plan of posts for each series, are in
[docs/series/](series/README.md):

- [Build it with Bynk](series/build-it.md): one service, built step by step.
- [The problem with…](series/the-problem-with.md): one problem, in five parts.
- [A closer look](series/a-closer-look.md): one feature of the language or
  its tools.
- [Inside the showcase](series/inside-the-showcase.md): one showcase project,
  read from top to bottom.
- [What's new in Bynk](series/whats-new.md): a look back over recent releases.
- [Coming from TypeScript](series/from-typescript.md): one thing a
  TypeScript developer writes by hand, and what Bynk declares instead.
- [Behind the decision](series/behind-the-decision.md): one design
  decision, from its record.

A post can also stand on its own. Leave out `series`, and choose headings
that suit it.

## Title and file name

**The title is the post's own point, not its series.** The series is shown
above the title on the post's page, so the title doesn't need to repeat it.
"Who gets the penny?" says more than "The problem with money", and the
reader still sees that it's part of *The problem with…*. Aim for a short
question or claim that the post answers or argues, in sentence case.

**The file name is the topic, and it's the URL.** A post at
`src/content/docs/posts/money.md` is served at `/blog/posts/money/`. Use one
or two lowercase words for what the post is about (`money`, `webhooks`,
`refined-types`), not the title, so the URL stays put if the title changes.
The topic must be unique across all the series. Two series are the
exception: a *What's new* post's slug carries the last version it covers
(`whats-new-0-661`), and a *Build it with Bynk* part's slug is
`turn-up-<part>` (`turn-up-3`), since their posts share one topic.

## Frontmatter

```yaml
---
title: "Who gets the penny?"
description: "About 155 characters for search results and link previews."
date: 2026-11-05
authors: matthew
tags: [types, data]    # one to four, from the fixed list (below)
excerpt: "Shown in post lists. Shorter than the description, not a copy of it."
series: the-problem-with   # see docs/series/; leave out for a standalone post
level: building        # first-steps | building | designing | contributing
showcase: money        # the bynk-lang/showcase project the code comes from
# showcase: [refined-types, decode-json]   # or several, as a list
# repo: starter        # or: another bynk-lang repository it comes from instead
bynkVersion: 0.639.1   # the Bynk release the post was written against (shown on the post)
video: https://youtu.be/VIDEO_ID   # optional: the post's YouTube video (a link or just the ID)
draft: true            # remove to publish
---
```

`description` is what search engines and link previews show, so keep it to
about 155 characters: search results cut off anything longer. Put the words
someone would search for near the start ("floating-point money", "webhook
signatures"), since the title is the post's own point and often doesn't
contain them. Write it as plain text, without backticks, because it's used
outside the page.

`date` is the publication date. Posts go out every three, five or seven days,
so check [the schedule](series/README.md#schedule) when you choose it. A
finished post can be merged early: it stays hidden until its date, then the
daily build publishes it.

`tags` come from a fixed list in
[`src/content.config.ts`](../src/content.config.ts), and the build fails on
any other. Each tag is a topic, broad enough to gather several posts: `types`,
`errors`, `validation`, `data`, `testing`, `tooling`, `http`, `security`,
`agents`, `capabilities`, `concurrency`, `deployment` and `getting-started`.
Give a post one to four. If a post needs a topic the list doesn't have, add it
there in the same pull request, but only if later posts will share it.

`level` says who the post is written for. It's shown above the title and in
post lists:

- **first-steps**: new to Bynk, or new to programming.
- **building**: can write Bynk and is building a real service.
- **designing**: shaping a system with capabilities, agents and contexts.
- **contributing**: working on the language or its toolchain.

`video` is the post's YouTube video, if it has one. The post links to it
("Watch on YouTube") at the top, under the date and author; the video isn't
embedded. Paste the video's link (a `youtube.com/watch` page or a `youtu.be`
short link) or just its 11-character ID; the build fails on anything else.
Only the ID is kept, so a start time in the link (`?t=90`) is ignored. The
RSS feed and search leave the link out, so write the post to stand on its own
without the video. [Making a video](making-a-video.md) covers making the video itself.

## Code

Every ` ```bynk ` block must be quoted from the showcase project named in
`showcase` (or from one of them, when it's a list), or, for a post about another bynk-lang repository such as the
starter template, from the repository named in `repo`. CI checks this (`scripts/check-snippets.mjs`), and a weekly canary
re-checks it as the showcase changes. You can dedent a snippet and leave out
blank lines and comments between the lines you quote. Nothing else may differ.

If a block is deliberately not from the showcase, such as a counter-example
that must not compile, mark it ` ```bynk nocheck `. Use this sparingly: an
unchecked block is one that can quietly go out of date.

## Style

- **British English**: "behaviour", "licence" (noun), "realise".
- **Sentence case** for titles and headings: "Who gets the penny?", not
  "Who Gets The Penny?". Names and code keep their own capitals ("SQL",
  "`Promise.all`").
- **Plain words.** Explain each term the first time it appears, in a few
  words: "a refined type, a type with a rule attached". Assume the reader is
  clever but new to the idea.
- **Warm, not smug.** Don't mock other languages or the people who use them.
  Avoid lines that read as a wink at the reader's expense.
- **Vary sentence length.** A run of very short sentences sounds like a
  lecture.
- **Check every claim.** Facts about Bynk come from the Book, the showcase or
  the compiler. Facts about other languages are checked against their
  documentation before publishing.

## Previewing

The first `npm install` needs a token for the site theme, which comes from
GitHub Packages: set it up once as the [README](../README.md#running-it)
describes.

```sh
npm install
npm run dev                 # http://localhost:4321/blog/ (drafts included)
npm run check:snippets -- ../showcase   # finds ../starter too, for `repo: starter` posts
```
