import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { docsLoader, i18nLoader } from "@astrojs/starlight/loaders";
import { docsSchema, i18nSchema } from "@astrojs/starlight/schema";
import { blogSchema } from "starlight-blog/schema";

// The rungs of the learning ladder. A post's `level` says who it is written
// for, so the blog can offer a path from a first program to designing with
// effects. Keep this list in step with LEVELS in src/lib/ladder.ts.
export const levels = ["first-steps", "building", "designing", "contributing"] as const;

// The blog's series. A post joins one with its `series` field; a post with no
// series stands on its own. Keep this list in step with SERIES in
// src/lib/ladder.ts, and give each series a plan in docs/series/.
export const series = ["the-problem-with", "a-closer-look", "inside-the-showcase", "whats-new"] as const;

// The blog's tags: a short, fixed list of topics, so each tag gathers enough
// posts to be worth a page of its own. A post takes one to four. Add a tag
// here only when several posts will share it (docs/writing-a-post.md). Pages
// that aren't posts, such as the home page, have none.
export const tags = [
  "getting-started",
  "types",
  "errors",
  "validation",
  "data",
  "testing",
  "tooling",
  "http",
  "security",
  "agents",
  "capabilities",
  "concurrency",
  "deployment",
] as const;

// When this build runs. A post dated after it is treated as a draft (see the
// `docs` schema below), and the daily deploy (.github/workflows/deploy.yml)
// publishes it on its date.
//
// The draft flag is decided when a post is parsed, and Astro caches parsed
// entries (node_modules/.astro/data-store.json) and skips files that haven't
// changed, so a cached build would keep a post hidden after its date. That's
// why `npm run build` and `npm run dev` pass `--force`, which clears the cache:
// the site takes seconds to build. Don't cache that store in CI. A dev server
// decides once, when it starts, so restart it to see a post whose date has come.
const buildTime = new Date();

// A YouTube video's ID, from the ID itself or a link to the video: a watch
// page (youtube.com/watch?v=…), a short link (youtu.be/…), or a Shorts, live
// or embed page. Anything else is returned as it was, for the schema to reject.
function youTubeId(value: string): string {
  if (/^[\w-]{11}$/.test(value)) return value;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return value;
  }
  const host = url.hostname.replace(/^(www|m|music)\./, "");
  if (host === "youtu.be") return url.pathname.slice(1);
  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (url.pathname === "/watch") return url.searchParams.get("v") ?? value;
    const match = url.pathname.match(/^\/(?:shorts|live|embed)\/([\w-]+)/);
    if (match) return match[1];
  }
  return value;
}

export const collections = {
  // The site's language is en-GB (for British date formats). starlight-blog
  // ships its UI strings under `en` only, so src/content/i18n/en-GB.json
  // carries a copy of them. Refresh it when the plugin adds strings.
  i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
  docs: defineCollection({
    loader: docsLoader(),
    // A post with a date after the build is scheduled, not published: it's
    // marked as a draft, so Starlight and starlight-blog leave it out of a
    // production build (its page, the post lists, tags and the RSS feed), and
    // `npm run dev` shows it with a draft badge. Every blog post has a date;
    // other pages don't, and are left alone.
    schema: (context) =>
      docsSchema({
        extend: (context) =>
          blogSchema(context).extend({
            // Topics from the fixed list above (`tags`).
            tags: z.array(z.enum(tags)).max(4).optional(),
            // The series a post belongs to (see `series` above).
            series: z.enum(series).optional(),
            // Who the post is written for (see `levels` above).
            level: z.enum(levels).optional(),
            // The bynk-lang/showcase project the post's Bynk code is quoted
            // from, or a list of them. scripts/check-snippets.mjs holds every
            // ```bynk block in the post to those projects' source, which CI and
            // the canary keep green.
            showcase: z.union([z.string(), z.array(z.string()).nonempty()]).optional(),
            // Another bynk-lang repository the post's Bynk code is quoted from
            // instead, such as `starter`. Checked the same way.
            repo: z.string().optional(),
            // The Bynk release the post was written against.
            bynkVersion: z.string().optional(),
            // The post's YouTube video, linked at the top of the post
            // (src/components/PostVideo.astro). Give its 11-character ID or
            // a YouTube link to it; the build keeps only the ID (so a start
            // time in the link is dropped), and fails on anything it can't
            // read one from.
            video: z
              .string()
              .trim()
              .transform(youTubeId)
              .pipe(z.string().regex(/^[\w-]{11}$/, "Give a YouTube video ID or a link to the video"))
              .optional(),
          }),
      })(context).transform((data) =>
        data.date && data.date > buildTime ? { ...data, draft: true } : data,
      ),
  }),
};
