# Writing a post

The blog explains the thinking behind Bynk. Posts don't repeat the Book or a
showcase README: they say why the language works the way it does, then send
the reader to the code.

## Series and shapes

Most posts belong to a series, and each series has its own shape: a set of
headings every post in it follows, so a reader knows what to expect. The
shapes, and the plan of posts for each series, are in
[docs/series/](series/README.md):

- [The problem with…](series/the-problem-with.md): one problem, in five parts.
- [A closer look](series/a-closer-look.md): one feature of the language or
  its tools.
- [Inside the showcase](series/inside-the-showcase.md): one showcase project,
  read from top to bottom.
- [What's new in Bynk](series/whats-new.md): a look back over recent releases.

A post can also stand on its own, as "Getting started with Bynk" does. Leave
out `series`, and choose headings that suit it.

## Frontmatter

```yaml
---
title: "The problem with money"
description: "One or two sentences for search results and link previews."
date: 2026-11-05
authors: matthew
tags: [types, decimal]
excerpt: "Shown in post lists. Shorter than the description, not a copy of it."
series: the-problem-with   # see docs/series/; leave out for a standalone post
level: building        # first-steps | building | designing | contributing
showcase: money        # the bynk-lang/showcase project the code comes from
# showcase: [refined-types, decode-json]   # or several, as a list
# repo: starter        # or: another bynk-lang repository it comes from instead
bynkVersion: 0.639.1   # the Bynk release the post was written against
draft: true            # remove to publish
---
```

`date` is the publication date. Posts go out every three, five or seven days,
so check [the schedule](series/README.md#schedule) when you choose it.

`level` puts the post on the blog's learning path:

- **first-steps**: new to Bynk, or new to programming.
- **building**: can write Bynk and is building a real service.
- **designing**: shaping a system with capabilities, agents and contexts.
- **contributing**: working on the language or its toolchain.

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
- **Sentence case** for titles and headings: "The problem with money", not
  "The Problem With Money". Names and code keep their own capitals ("SQL",
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

```sh
npm install
npm run dev                 # http://localhost:4321/blog/ (drafts included)
npm run check:snippets -- ../showcase   # finds ../starter too, for `repo: starter` posts
```
