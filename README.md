# Bynk blog

The thinking behind [Bynk](https://bynk-lang.org), one idea at a time.

The blog is an [Astro](https://astro.build) site using
[Starlight](https://starlight.astro.build) and
[starlight-blog](https://github.com/HiDeoo/starlight-blog). Its look comes
from the Bynk site theme ([bynk-lang/site-theme](https://github.com/bynk-lang/site-theme)),
which bynk-lang.org uses too. It's built to be served at **bynk-lang.org/blog/**.

## Writing

Posts live in [`src/content/docs/posts/`](src/content/docs/posts/). Read
[docs/writing-a-post.md](docs/writing-a-post.md) before writing one, and see
[docs/series/](docs/series/) for the series, the publishing rhythm and what's
coming.

The blog's home page, [`src/content/docs/index.mdx`](src/content/docs/index.mdx),
points newcomers to "Getting started", then lists the latest posts and each
series. Every series with a published post also has its own page,
`/blog/series/<id>/` ([`src/pages/series/`](src/pages/series/)), listing its
posts in reading order. A post shows its series, level and Bynk version above
its title, and ends with the previous and next posts in its series. All of
this is built from post frontmatter (`series`, `level` and `bynkVersion`), so
a new post appears everywhere without editing a page.
[`src/content/docs/about.mdx`](src/content/docs/about.mdx) is the About page,
linked from the bottom of the home page.

## Running it

The site theme, `@bynk-lang/site-theme`, comes from GitHub Packages, which
needs a token even to read. Create a classic personal access token with only
the `read:packages` scope, and add it to your user-level `~/.npmrc` (never
this repository's):

```ini
//npm.pkg.github.com/:_authToken=YOUR_TOKEN
```

The project's [`.npmrc`](.npmrc) already says where `@bynk-lang` packages
live. CI uses the workflow's own token.

```sh
npm install
npm run dev       # http://localhost:4321/blog/
npm run check     # type-check the config, components and pages
npm run build     # into dist/
```

On bynk-lang.org the blog's search also covers the docs site: the deploy sets
`BYNK_MERGE_SEARCH`, and the search then loads the docs site's Pagefind index
from `/pagefind/` too, at half weight so posts lead (the docs site does the
same with the blog's). A local build leaves it off, because Pagefind returns
nothing at all when a merged index fails to load. Every blog page gives search
the title "Blog · <title>" (`src/components/PageTitle.astro`), so its results
stand out in the docs site's search. Keep Pagefind on the same minor version
as the docs site's: CI warns when they differ.

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
  after CI passes on `main`, and every morning at 05:17 UTC, and uploads
  `dist/` to the `bynk-blog` Cloudflare Pages project. A post dated in the
  future is left out of a build until its date, so the daily build is what
  publishes a post merged ahead of time. GitHub pauses a scheduled workflow
  after 60 days without activity in the repository.
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

## The look

The colours, type, wordmark, header and Bynk highlighting all come from the
site theme, added as a Starlight plugin in
[`astro.config.mjs`](astro.config.mjs). Change them in
[bynk-lang/site-theme](https://github.com/bynk-lang/site-theme), release it,
and update the dependency here. Only blog-specific styles live in this
repository, in [`src/styles/blog.css`](src/styles/blog.css).
