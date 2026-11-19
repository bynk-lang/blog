import { getCollection, type CollectionEntry } from "astro:content";

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
// with its `series` frontmatter field. Keep the ids in step with `series` in
// src/content.config.ts. Each series has a plan in docs/series/.
export const SERIES = {
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
} as const;

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
