// Each published post, and the blog's home page, gets a social preview
// image: its card from src/pages/og/ (src/lib/og.ts), as og:image and
// twitter:image, with its size and a description for people who can't see it.
// A page that already declares an og:image (a post with a `cover`) keeps it.
import { defineRouteMiddleware } from "@astrojs/starlight/route-data";

export const onRequest = defineRouteMiddleware((context) => {
  const route = context.locals.starlightRoute;
  const { id, entry } = route;
  const isPost = id.startsWith("posts/") && entry.data.date !== undefined && !entry.data.draft;
  // Starlight gives the home page the id "".
  const isHome = id === "";
  if (!(isPost || isHome)) return;
  if (route.head.some((h) => h.tag === "meta" && h.attrs?.property === "og:image")) return;

  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const image = new URL(`${base}/og/${isHome ? "index" : id}.png`, context.site).href;
  const alt = isPost ? `${entry.data.title}, on the Bynk Blog` : "The Bynk Blog";
  route.head.push(
    { tag: "meta", attrs: { property: "og:image", content: image } },
    { tag: "meta", attrs: { property: "og:image:width", content: "1200" } },
    { tag: "meta", attrs: { property: "og:image:height", content: "630" } },
    { tag: "meta", attrs: { property: "og:image:alt", content: alt } },
    { tag: "meta", attrs: { name: "twitter:image", content: image } },
  );
});
