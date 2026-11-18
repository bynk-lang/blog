# Bynk blog

The thinking behind [Bynk](https://bynk-lang.org), one problem at a time.

The blog is an [Astro](https://astro.build) site using
[Starlight](https://starlight.astro.build) and
[starlight-blog](https://github.com/HiDeoo/starlight-blog), styled to match
bynk-lang.org. It's built to be served at **bynk-lang.org/blog/**.

## Writing

Posts live in [`src/content/docs/posts/`](src/content/docs/posts/). Read
[docs/writing-a-post.md](docs/writing-a-post.md) before writing one, and see
[docs/series-plan.md](docs/series-plan.md) for what's coming.

The blog's home page, [`src/content/docs/index.mdx`](src/content/docs/index.mdx),
lists the series and a learning path. Both are built from post frontmatter
(`series` and `level`), so a new post appears there without editing the page.

## Running it

```sh
npm install
npm run dev       # http://localhost:4321/blog/
npm run build     # into dist/
```

## Bynk code is checked

Every ` ```bynk ` block in a post must be quoted from the
[showcase](https://github.com/bynk-lang/showcase) project the post names in
its `showcase` field. The showcase's own CI formats, type-checks and tests
every project, and the org canary re-runs them on each Bynk release, so a
quoted snippet is code that compiles and is tested.

```sh
git clone https://github.com/bynk-lang/showcase ../showcase
npm run check:snippets -- ../showcase
```

CI runs this on every pull request. The
[snippet canary](.github/workflows/snippets-canary.yml) runs it weekly, and
on each `bynk-canary` dispatch once this repository is enrolled with the org
dispatcher, and keeps a `snippets` issue open while a post has drifted.

## Deploying

[`deploy.yml`](.github/workflows/deploy.yml) builds the site after CI passes
on `main` and uploads `dist/` to the `bynk-blog` Cloudflare Pages project. It
needs the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets. Until
they exist, it builds and skips the upload.

Every URL sits under `/blog/`, so the bynk-lang.org zone can route
`bynk-lang.org/blog/*` to the Pages project without clashing with the main
site. To serve the blog from a subdomain instead, set the `BLOG_SITE` and
`BLOG_BASE` repository variables (for example `https://blog.bynk-lang.org`
and `/`).

## Bynk highlighting

[`src/grammars/bynk.tmLanguage.json`](src/grammars/bynk.tmLanguage.json) is a
copy of the VS Code extension's grammar, as the docs site keeps one. Refresh
it from [vscode-bynk](https://github.com/bynk-lang/vscode-bynk) when the
grammar changes.
