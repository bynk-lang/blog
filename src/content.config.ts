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

// When this build runs. A post dated after it is treated as a draft (see
// `scheduled` below), and the daily deploy (.github/workflows/deploy.yml)
// publishes it on its date.
const buildTime = new Date();

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
          }),
      })(context).transform((data) =>
        data.date && data.date > buildTime ? { ...data, draft: true } : data,
      ),
  }),
};
