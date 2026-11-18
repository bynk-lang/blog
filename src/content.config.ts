import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { docsLoader, i18nLoader } from "@astrojs/starlight/loaders";
import { docsSchema, i18nSchema } from "@astrojs/starlight/schema";
import { blogSchema } from "starlight-blog/schema";

// The rungs of the learning ladder. A post's `level` says who it is written
// for, so the blog can offer a path from a first program to designing with
// effects. Keep this list in step with LEVELS in src/lib/ladder.ts.
export const levels = ["first-steps", "building", "designing", "contributing"] as const;

export const collections = {
  // The site's language is en-GB (for British date formats). starlight-blog
  // ships its UI strings under `en` only, so src/content/i18n/en-GB.json
  // carries a copy of them. Refresh it when the plugin adds strings.
  i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: (context) =>
        blogSchema(context).extend({
          // The series a post belongs to, such as `the-problem-with`.
          series: z.string().optional(),
          // Who the post is written for (see `levels` above).
          level: z.enum(levels).optional(),
          // The bynk-lang/showcase project the post's Bynk code is quoted
          // from. scripts/check-snippets.mjs holds every ```bynk block in the
          // post to that project's source, which CI and the canary keep green.
          showcase: z.string().optional(),
          // The Bynk release the post was written against.
          bynkVersion: z.string().optional(),
        }),
    }),
  }),
};
