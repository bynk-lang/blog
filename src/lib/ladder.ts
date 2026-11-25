import { getCollection, type CollectionEntry } from "astro:content";
import type { series } from "../content.config";

// The learning path the blog is organised around. Each post's `level` names
// one of these rungs. Keep the ids in step with `levels` in
// src/content.config.ts.
export const LEVELS = [
  {
    id: "first-steps",
    title: "First steps",
    blurb: "New to Bynk, or new to programming. Start here.",
  },
  {
    id: "building",
    title: "Building a service",
    blurb: "You can write Bynk. These posts are about the problems you meet building real services.",
  },
  {
    id: "designing",
    title: "Designing with effects",
    blurb: "Capabilities, agents and contexts: shaping a system so the compiler can check its architecture.",
  },
  {
    id: "contributing",
    title: "Contributing to Bynk",
    blurb: "How the language and its toolchain work inside, for people who want to help build them.",
  },
] as const;

// The blog's series, in the order the home page shows them. A post joins one
// with its `series` frontmatter field. The keys must be exactly the ids in
// `series` in src/content.config.ts: the `satisfies` below makes a missing or
// misspelt one a type error. Each series has a plan in docs/series/.
export const SERIES = {
  "build-it": {
    title: "Build it with Bynk",
    blurb:
      "One small service built step by step, from an empty folder to a live deployment. Follow along and finish each post with working, tested code.",
  },
  "the-problem-with": {
    title: "The problem with…",
    blurb:
      "Each post takes a problem that bites people in practice, looks at how it is usually handled, and explains how Bynk approaches it and what that costs.",
  },
  "a-closer-look": {
    title: "A closer look",
    blurb:
      "One feature of the language or its tools, explored in depth: what it does, how to use it, and why it works the way it does.",
  },
  "inside-the-showcase": {
    title: "Inside the showcase",
    blurb:
      "One showcase project read from top to bottom, to see how the pieces of a real Bynk program fit together.",
  },
  "whats-new": {
    title: "What's new in Bynk",
    blurb:
      "A look back over recent releases: what changed, why it changed, and what it means for code you have already written.",
  },
  "from-typescript": {
    title: "Coming from TypeScript",
    blurb:
      "Something a TypeScript or Workers developer already writes by hand, and what Bynk declares instead: the code, what the compiler emits, and what you give up.",
  },
  "behind-the-decision": {
    title: "Behind the decision",
    blurb:
      "One design decision, told from its record: the question, the options weighed, why one won, and what it costs.",
  },
} as const satisfies Record<(typeof series)[number], { title: string; blurb: string }>;

export type Post = CollectionEntry<"docs">;

// Published posts, newest first. Drafts are left out of production builds.
export async function posts(): Promise<Post[]> {
  const entries = await getCollection(
    "docs",
    (entry) => entry.id.startsWith("posts/") && (import.meta.env.DEV || !entry.data.draft),
  );
  return entries.sort((a, b) => (b.data.date?.getTime() ?? 0) - (a.data.date?.getTime() ?? 0));
}

export function href(post: Post): string {
  return `${import.meta.env.BASE_URL}${post.id}/`.replace(/\/{2,}/g, "/");
}

export type SeriesId = keyof typeof SERIES;
export type LevelId = (typeof LEVELS)[number]["id"];

// A level's display title, such as "Building a service".
export function levelTitle(id: LevelId): string {
  return LEVELS.find((level) => level.id === id)?.title ?? id;
}

// A series' own page: src/pages/series/[series].astro.
export function seriesHref(id: SeriesId): string {
  return `${import.meta.env.BASE_URL}/series/${id}/`.replace(/\/{2,}/g, "/");
}

// A series' published posts in reading order, oldest first.
export async function seriesPosts(id: SeriesId): Promise<Post[]> {
  return (await posts()).filter((post) => post.data.series === id).reverse();
}
