# Bynk blog

The thinking behind [Bynk](https://bynk-lang.org), one idea at a time.

The blog is an [Astro](https://astro.build) site using
[Starlight](https://starlight.astro.build) and
[starlight-blog](https://github.com/HiDeoo/starlight-blog), styled to match
bynk-lang.org. It's built to be served at **bynk-lang.org/blog/**.

## Writing

Posts live in [`src/content/docs/posts/`](src/content/docs/posts/). Read
[docs/writing-a-post.md](docs/writing-a-post.md) before writing one, and see
[docs/series/](docs/series/) for the series, the publishing rhythm and what's
coming.

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
[showcase](https://github.com/bynk-lang/showcase) project (or projects) the
post names in its `showcase` field, or from the repository it names in `repo`. The showcase's own CI formats, type-checks and tests
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

Two pieces, each with its own workflow, both gated on the
`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets. Until the secrets
exist, each builds and skips the upload.

- **The site.** [`deploy.yml`](.github/workflows/deploy.yml) builds the site
  after CI passes on `main` and uploads `dist/` to the `bynk-blog` Cloudflare
  Pages project.
- **The proxy.** [`proxy/`](proxy/) is a small Worker on the routes
  `bynk-lang.org/blog` and `bynk-lang.org/blog/*`. It strips `/blog` and
  fetches each page from the Pages project, so the blog appears at
  bynk-lang.org/blog/ while the main site stays its own project.
  [`deploy-proxy.yml`](.github/workflows/deploy-proxy.yml) deploys it when it
  changes. See [proxy/README.md](proxy/README.md) for setting it up.

Every URL sits under `/blog/`. To serve the blog from a subdomain instead, set
the `BLOG_SITE` and `BLOG_BASE` repository variables (for example
`https://blog.bynk-lang.org` and `/`) and drop the proxy.

## Licence

The posts (`src/content/docs/`) and the guides (`docs/`) are licensed under
[CC BY 4.0](LICENSE-CC-BY-4.0.md). The site's code is licensed under
[MIT](LICENSE-MIT). Code quoted from the showcase keeps its own licence (MIT
or Apache-2.0).

## Bynk highlighting

[`src/grammars/bynk.tmLanguage.json`](src/grammars/bynk.tmLanguage.json) is a
copy of the VS Code extension's grammar, as the docs site keeps one. Refresh
it from [vscode-bynk](https://github.com/bynk-lang/vscode-bynk) when the
grammar changes.
