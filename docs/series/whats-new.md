# What's new in Bynk

Each post looks back over recent releases: what changed, why it changed, and
what it means for code people have already written.

## Bynk doesn't have big releases

Bynk is built in small, specified increments, and every merge gets its own
version. Version 0.639 alone has more than thirty patch releases. So a post
in this series covers a **span** of versions, not one release. Name the span
in the title, such as "What's new in Bynk: 0.639 to 0.645", and say in the
first paragraph which versions it covers.

Roughly one post a month is enough. Write one sooner if a notable change
lands, such as a new capability, a breaking change, or a feature leaving
experimental.

## Sources

- The [release pages](https://bynk-lang.org/reference/releases/)
  (`site/src/content/docs/reference/releases/` in `bynk-lang/bynk`): one page
  per release, one row per increment, with the increments not yet released on
  `unreleased.md`.
- The decision records in `design/decisions/` in `bynk-lang/bynk`, for why a
  change was made and what else was considered.
- The VS Code extension's `CHANGELOG.md`, for changes to the editor.

The release pages are exhaustive. The post is a selection: pick the handful of
changes a Bynk developer would notice, and leave out internal ones, such as a
change to how the compiler builds its output that doesn't change what the
output does.

## Shape

Use these as headings.

1. **The headline.** The one or two changes that matter most in this span,
   and who they matter to.
2. **What changed.** The rest of the selection, grouped: the language, the
   tools (the compiler, `bynk` and the editor), and the platform (what runs
   on Cloudflare). A sentence or two each, with a link to the Book page.
3. **If you're upgrading.** Every breaking change, with what to change in
   your code. Say "none" if there aren't any: that's worth knowing too.
4. **Behind the decisions.** One change explained in more depth, from its
   decision record: the problem, the options and why this one won.
5. **Try it.** How to upgrade, and the showcase projects that show the new
   features.

Don't promise what comes next. The Book's roadmap page says what's planned,
and a link to it is enough.

## Notes for writers

- **Code.** Quote from a showcase project that uses the new feature, as in
  every series. If none does yet, a ` ```bynk nocheck ` block is acceptable
  here, but say so in the pull request, and replace it once the showcase
  catches up.
- **Version.** Set `bynkVersion` to the last version the post covers.

## Plan

| # | Covers | Notes |
|---|---|---|
| 1 | From 0.639.1, the version the first posts were written against, to whatever is current when it's written | Read the release rows since 0.639.1 and pick what a developer would notice |
