# Review guidelines for the Bynk blog

These are the maintainers' notes for reviewing a pull request here. Bynk is a
programming language, and the blog explains its design decisions, often as
part of a series such as *The problem with…*. Most pull requests add or revise
a post in `src/content/docs/posts/`. A post is judged as writing as well as
content.

Skip what CI already enforces: the site builds (`astro build`), the
frontmatter fits the schema in `src/content.config.ts`, and every ` ```bynk `
block matches the showcase project (or projects) named in `showcase`
(`scripts/check-snippets.mjs`). A block marked ` ```bynk nocheck ` isn't
checked, so read it as closely as the prose.

[docs/writing-a-post.md](../docs/writing-a-post.md) is the house guide: the
frontmatter, the levels and the style. Each series has its own shape, the
headings every post in it follows, in [docs/series/](../docs/series/README.md):
check a post against its series' shape. Read the series' other posts too (the
files in `src/content/docs/posts/` with the same `series`) before judging
consistency.

## The two readers

Review every post with two readers in mind:

1. **A newer developer** who knows the basics of programming, but not the
   jargon of type systems or language design.
2. **An experienced developer coming from another language**, most likely
   JavaScript or TypeScript, but possibly Java, C#, Python, Rust, Kotlin or
   Swift. They will notice any mistake and any overclaim.

A post should be easy to follow for the first reader, and credible to the
second. For each finding, say which reader it affects.

## What to check, in order of priority

### 1. Technical accuracy and consistency

- Does every code example follow the rules the post itself states? If the
  post says numeric types never mix, no example may mix them. A counter-example
  is the exception: a ` ```bynk nocheck ` block that the prose clearly presents
  as wrong, such as code that must not compile, is meant to break the rules.
  Check instead that the prose says why it's wrong, and that the reason is
  right.
- Is each claim about another language accurate? Look especially for sweeping
  statements an expert in that language would reject.
- Are there overclaims ("never", "always", "in other languages") that need
  qualifying?
- Is anything used before it's introduced, or used without being shown at all:
  a helper function, an error variant, a method named in a list?
- Does every step of a worked example agree with the rest of the post: the
  figures, the names, what each function returns?
- A claim about Bynk that neither the post's code nor this repository
  supports is a question for the author, not an error. Say what would settle
  it (the Book page, the showcase file).

### 2. Tone

- Flag anything that might read as smug, sarcastic or dismissive of other
  languages, or of developers who use the approaches being criticised. A
  clever line that might misfire counts too.
- The post should be confident and honest about trade-offs, not evangelical.
- Note where the rhythm turns clipped or lecturing, such as a run of very short
  sentences.
- Check that the opening and the closing line tie back to the central idea.

### 3. Accessibility

- Flag each term of jargon used without an explanation where it first
  appears, and suggest a short one that fits in brackets or the same sentence:
  "a refined type (a type with a rule attached)".
- Note where an unfamiliar piece of syntax needs a brief aside.

### 4. Bridges for experienced readers

- Suggest where one sentence connecting Bynk to something they already know
  would help, such as TypeScript's `flatMap` or Java's `BigDecimal`.
- Check that prior art is named specifically rather than vaguely, and that
  Bynk's position relative to it is fair.
- For TypeScript readers, check the post says what a feature means on their
  side, such as how values arrive over the wire.

### 5. Frontmatter and series consistency

- Does `level` match how demanding the content really is (`first-steps`,
  `building`, `designing`, `contributing`, as writing-a-post.md defines them)?
- Do `description` and `excerpt` both match the post's thesis without
  repeating each other word for word?
- Compare with the series' other posts: the frontmatter fields, the title's
  capitalisation, the five headings (The problem / How it's usually handled /
  Bynk's answer / The trade-offs / See it working), and the style of the
  closing line.
- A post with `draft: true` isn't published. Removing it is the author's call,
  but say whether the post is ready for it.

## How to write the review

- **The summary** opens with a verdict of two or three sentences: does the
  post land, what's strongest, and what's the biggest risk? It ends by saying
  whether the post is ready to publish and, if not, what must change first.
- **Each issue is a finding on the line it concerns,** most serious first.
  Say what's wrong, which reader it affects, and a specific fix. Where a few
  words of rewording would fix it, give the rewording as a suggestion.
- **Severity:**
  - **Blocking:** a technical error or inconsistency, a claim about another
    language that's wrong, or a code example meant to be valid that breaks
    the post's own rules.
  - **Should fix:** an overclaim, a line that might read as smug or
    dismissive, unexplained jargon a newcomer will trip on, a missing bridge
    that leaves an experienced reader unconvinced, or frontmatter out of step
    with the post or the series.
  - **Nit:** rhythm, small wording and minor consistency points. Keep these
    few.
- Don't rewrite the post, and don't list things that are fine just to be
  thorough. Prose choices that are a matter of taste, when the meaning is
  clear, are the author's.
- British English throughout: "behaviour", "realise", "licence" as a noun.

## Follow-up reviews

On a later review of a revised post, say in `resolved` which earlier threads
the revision has fixed. Look for anything new the changes have introduced.
Keep the summary short: a verdict, then only what's still outstanding.

## Changes that aren't posts

- **The site** (`src/components`, `src/lib`, `astro.config.mjs`): check
  behaviour and accessibility of the pages, and that anything a reader sees
  stays in British English.
- **The proxy** (`proxy/`), the Worker that serves the blog at
  `bynk-lang.org/blog/`: it sends `/blog` to `/blog/`, passes each response
  through unchanged, and only turns a redirect to the Pages project back into
  a `/blog/` URL (see `proxy/README.md`). Flag a change to what it returns,
  and check `proxy/test` covers it.
- **The workflows:** actions stay pinned by commit SHA, and secrets stay out
  of code and logs.
- **The docs** (`docs/`): check the writing guide and the series plan stay in
  step with the posts.
