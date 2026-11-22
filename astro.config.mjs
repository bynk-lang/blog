// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightBlog from "starlight-blog";
// The Bynk brand, shared with bynk-lang.org (bynk-lang/site-theme): the
// design-system colours and type, the wordmark, the cross-site header, and the
// Bynk grammar and code themes.
import bynkSiteTheme from "@bynk-lang/site-theme";

// The blog is built to live under a path on the main site, bynk-lang.org/blog,
// so every page, asset and the search index sit under `base`. Both values can
// be overridden at build time, for example to serve it from a subdomain
// instead: BLOG_SITE=https://blog.bynk-lang.org BLOG_BASE=/ npm run build
const site = process.env.BLOG_SITE || "https://bynk-lang.org";
const base = process.env.BLOG_BASE || "/blog";

// https://astro.build/config
export default defineConfig({
  site,
  base,
  trailingSlash: "always",
  integrations: [
    starlight({
      title: "Bynk Blog",
      // British English: dates read "18 Nov 2026".
      locales: { root: { label: "English", lang: "en-GB" } },
      favicon: "/favicon.svg",
      // One search box covers both sites (web presence slice 7): the blog's
      // search also searches the docs site's index, served on the same origin
      // at /pagefind/. Its pages rank at half weight so the posts lead. The
      // docs site merges the blog's index the same way.
      //
      // The deploy sets BYNK_MERGE_SEARCH when the live docs index shares
      // this site's Pagefind minor version; CI sets it to check the config.
      // Pagefind returns no results at all when a merged index fails to load,
      // and the docs site's index exists only on bynk-lang.org, so a local
      // build or preview searches the blog alone.
      //
      // The docs index is at /pagefind/ only on bynk-lang.org, so a build for
      // another host (BLOG_SITE/BLOG_BASE, say a subdomain) never merges.
      //
      // The deploy checks versions once, at build time. If the docs site later
      // deploys a different Pagefind minor version, this site's search returns
      // nothing until the blog next deploys (the daily build at the latest).
      ...(process.env.BYNK_MERGE_SEARCH && site === "https://bynk-lang.org" && base === "/blog"
        ? {
            pagefind: {
              mergeIndex: [{ bundlePath: "/pagefind/", indexWeight: 0.5, language: "en-gb" }],
            },
          }
        : {}),
      // Blog-only styles. The theme's styles come first.
      customCss: ["./src/styles/blog.css"],
      components: {
        // The post's series, level and Bynk version, above its title.
        PageTitle: "./src/components/PageTitle.astro",
        // starlight-blog's post content, plus each series' own previous and
        // next posts. With this override in place the plugin doesn't add its
        // own, and logs a warning saying so: this file renders the plugin's
        // component itself (starlight-blog/components/MarkdownContent.astro).
        MarkdownContent: "./src/components/MarkdownContent.astro",
      },
      plugins: [
        // The blog is built and previewed on its own, so the header's links to
        // the rest of the site are absolute.
        bynkSiteTheme({ origin: "https://bynk-lang.org" }),
        starlightBlog({
          title: "Bynk Blog",
          // Posts live under /blog/posts/. The blog's own home page, /blog/,
          // is src/content/docs/index.mdx: the series and the learning path.
          prefix: "posts",
          // The theme's header carries the navigation, so the plugin adds no
          // links.
          navigation: "none",
          postCount: 10,
          recentPostCount: 10,
          metrics: { readingTime: true },
          authors: {
            matthew: {
              name: "Matthew Gibbons",
              url: "https://github.com/accuser",
            },
          },
        }),
      ],
      social: [{ icon: "github", label: "GitHub", href: "https://github.com/bynk-lang/blog" }],
    }),
  ],
});
