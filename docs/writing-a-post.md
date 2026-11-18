# Writing a post

The blog explains the thinking behind Bynk. Posts don't repeat the Book or a
showcase README: they say why the language works the way it does, then send
the reader to the code.

## The Problem With… shape

Every post in the series follows the same five parts. Use them as headings.

1. **The problem.** Something that goes wrong in practice, described so a
   newcomer understands why it matters. Start from what the reader has seen,
   not from Bynk.
2. **How it's usually handled.** The conventions, libraries and discipline
   other languages rely on, and where each one stops short. Name the prior art
   (`BigDecimal`, decimal.js and so on) and treat it with respect: some
   readers use it every day.
3. **Bynk's answer.** What the language or compiler takes on, and what it
   leaves to you. Quote code from the showcase project.
4. **The trade-offs.** What the approach costs or rules out. Be specific and
   honest. This is the section that earns an experienced reader's trust.
5. **See it working.** Link the showcase project, show how to run its tests,
   and link the Book's guide and reference pages. End with one sentence that
   returns to the problem.

## Frontmatter

```yaml
---
title: "The Problem With Money"
description: "One or two sentences for search results and link previews."
date: 2026-11-18
authors: matthew
tags: [types, decimal]
excerpt: "Shown in post lists. Usually the same as the description."
series: the-problem-with
level: building        # first-steps | building | designing | contributing
showcase: money        # the bynk-lang/showcase project the code comes from
# repo: starter        # or: another bynk-lang repository it comes from instead
bynkVersion: 0.639.1   # the Bynk release the post was written against
draft: true            # remove to publish
---
```

`level` puts the post on the blog's learning path:

- **first-steps**: new to Bynk, or new to programming.
- **building**: can write Bynk and is building a real service.
- **designing**: shaping a system with capabilities, agents and contexts.
- **contributing**: working on the language or its toolchain.

## Code

Every ` ```bynk ` block must be quoted from the showcase project named in
`showcase`, or, for a post about another bynk-lang repository such as the
starter template, from the repository named in `repo`. CI checks this (`scripts/check-snippets.mjs`), and a weekly canary
re-checks it as the showcase changes. You can dedent a snippet and leave out
blank lines and comments between the lines you quote. Nothing else may differ.

If a block is deliberately not from the showcase, such as a counter-example
that must not compile, mark it ` ```bynk nocheck `. Use this sparingly: an
unchecked block is one that can quietly go out of date.

## Style

- **British English**: "behaviour", "licence" (noun), "realise".
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
