// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightBlog from "starlight-blog";
// Bynk highlighting is a TextMate grammar (scopeName: source.bynk), which Shiki
// consumes directly. This is a copy of the docs site's copy (bynk-lang/bynk,
// site/src/grammars/), itself copied from the VS Code extension
// (bynk-lang/vscode-bynk, syntaxes/bynk.tmLanguage.json). Refresh it from the
// extension when its grammar changes.
import bynkGrammar from "./src/grammars/bynk.tmLanguage.json" with { type: "json" };

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
      // The same brand as bynk-lang.org: one electric-indigo accent, Inter for
      // body text and Literata for headings.
      customCss: ["./src/styles/brand.css", "./src/styles/blog.css"],
      components: {
        // The cross-surface nav from bynk-lang.org, pointing back at the main
        // site, so a reader can move between the blog, the Book and the docs.
        Header: "./src/components/Header.astro",
        Head: "./src/components/Head.astro",
      },
      plugins: [
        starlightBlog({
          title: "Bynk Blog",
          // Posts live under /blog/posts/. The blog's own home page, /blog/,
          // is src/content/docs/index.mdx: the series and the learning path.
          prefix: "posts",
          // Our Header carries the navigation, so the plugin adds no links.
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
      expressiveCode: {
        shiki: {
          langs: [
            {
              ...bynkGrammar,
              name: "bynk",
              embeddedLangsLazy: ["sql", "json", "html", "css", "javascript"],
            },
          ],
        },
      },
      social: [{ icon: "github", label: "GitHub", href: "https://github.com/bynk-lang/blog" }],
    }),
  ],
});
