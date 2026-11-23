// A social preview card for each published post, and one for the blog's home
// page, at /blog/og/<page>.png (see src/lib/og.ts). src/routeData.ts points
// each page's og:image at its card.
import type { APIRoute, GetStaticPaths } from "astro";
import { posts, levelTitle, SERIES } from "../../lib/ladder";
import { cardPng, type Card } from "../../lib/og";

export const getStaticPaths = (async () => {
  const cards = (await posts()).map((post) => {
    const { title, series, level } = post.data;
    const card: Card = {
      title,
      eyebrow: series ? SERIES[series].title : undefined,
      footnote: level ? levelTitle(level) : undefined,
    };
    return { params: { slug: post.id }, props: { card } };
  });
  const home: Card = { title: "The thinking behind Bynk, one idea at a time." };
  return [{ params: { slug: "index" }, props: { card: home } }, ...cards];
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const png = await cardPng(props.card as Card);
  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png" } });
};
