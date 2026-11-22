// The newest posts, as JSON, at /blog/posts.json (web presence slice 8,
// bynk-lang/bynk#4025). The docs site's home page reads it when it builds,
// for its "From the blog" section, so the post cards there carry the same
// series, level and Bynk version as the posts themselves. The RSS feed has no
// room for those.
//
// Published posts only, newest first: a scheduled post (dated after the
// build) is a draft and stays out, as it does from the RSS feed.
import type { APIRoute } from "astro";
import { posts, href, levelTitle, SERIES } from "../lib/ladder";

/** How many posts the list carries: enough for any page that shows a few. */
const LIMIT = 10;

export const GET: APIRoute = async () => {
  const list = (await posts()).slice(0, LIMIT).map((post) => {
    const { title, excerpt, description, date, series, level, bynkVersion } = post.data;
    return {
      title,
      url: href(post),
      summary: excerpt ?? description,
      date: date?.toISOString(),
      series: series ? SERIES[series].title : undefined,
      level: level ? levelTitle(level) : undefined,
      bynkVersion,
    };
  });
  return new Response(JSON.stringify({ posts: list }, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};
