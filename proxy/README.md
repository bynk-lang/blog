# The /blog proxy

A small Cloudflare Worker that serves the blog at **bynk-lang.org/blog/** from
its own Pages project.

bynk-lang.org is the docs site's Pages project, deployed from
`bynk-lang/bynk`. This Worker is attached to two routes on the same zone,
`bynk-lang.org/blog` and `bynk-lang.org/blog/*`
([wrangler.toml](wrangler.toml)). A Worker route takes precedence over a Pages
custom domain on the same hostname, so those requests come here and
everything else still goes to the docs site.

For each request, the Worker ([src/index.ts](src/index.ts)):

1. sends `/blog` to `/blog/`;
2. removes the `/blog` prefix and fetches the same path, query, method,
   headers and body from the blog's Pages project (`UPSTREAM`);
3. returns the response unchanged, except that a redirect back into the Pages
   project (such as `/posts/x` → `/posts/x/`) gets its `/blog` prefix back, so
   the browser stays on bynk-lang.org.

The blog is built with `base: "/blog"`, so every page already links to
`/blog/...` and the browser keeps coming back through the Worker.

## Running the checks

```sh
cd proxy
npm install
npm run typecheck
npm test                                  # node:test, with fetch stubbed
npx wrangler deploy --dry-run --outdir dist
```

CI runs all three. [deploy-proxy.yml](../.github/workflows/deploy-proxy.yml)
deploys the Worker after CI passes on a push to `main` that changes it.

## Setting it up

1. Deploy the blog to its Pages project, `bynk-blog`
   ([deploy.yml](../.github/workflows/deploy.yml)). Check that
   `https://bynk-blog.pages.dev/` serves the home page. Its styles won't load
   there, because they're linked under `/blog/`, and that's expected.
2. Add the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets to this
   repository. The token needs **Workers Scripts: Edit** on the account and
   **Workers Routes: Edit** on the `bynk-lang.org` zone, as well as
   **Cloudflare Pages: Edit** for the site's own deploy.
3. Run **Deploy proxy** from the Actions tab, or merge a change to `proxy/`.
4. Check `https://bynk-lang.org/blog/` and a post, and that
   `https://bynk-lang.org/blog` redirects to it.

## Why not Bynk?

This would be a good Bynk exemplar, but today Bynk can't express it cleanly.
A route's `:name` segment matches one path segment, so there's no route for
"everything under `/blog/`". A raw response is either 200 or an error status
named in the code, so an upstream 304, 404 or redirect can't be passed through
as it came. And the HTTP boundary adds its own `ETag` and answers `HEAD` and
`OPTIONS` itself, which a proxy mustn't do.

These issues on `bynk-lang/bynk` track what would change that:

- [#3752](https://github.com/bynk-lang/bynk/issues/3752): the track for rest
  segments and pass-through responses, including whether Bynk should do this
  at all.
- [#3753](https://github.com/bynk-lang/bynk/issues/3753): reserving `*`, `{`
  and `}` in routes before 1.0, so a rest segment can be added later without
  breaking anything.

When they land, this Worker becomes the proof: rewrite it in Bynk and move it
into the showcase.
