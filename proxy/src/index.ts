// Serves the blog at bynk-lang.org/blog/ from its own Cloudflare Pages project.
//
// bynk-lang.org is the docs site's Pages project. This Worker's routes
// (wrangler.toml) take precedence over that custom domain for /blog and
// /blog/*, so those requests come here. The Worker removes the /blog prefix,
// fetches the same path from the blog's Pages project and returns the
// response unchanged, except that a redirect to the Pages project is turned
// back into a /blog/ URL on bynk-lang.org.
//
// The blog is built with base /blog, so the pages it serves already link to
// /blog/... and the browser keeps coming back through this Worker.
//
// Why not Bynk? A Bynk route segment matches one path segment, and a Bynk
// response can't pass an upstream status and headers through unchanged. The
// issues on bynk-lang/bynk that would make it possible are linked from
// proxy/README.md.

export interface Env {
  // The blog's Pages project, such as https://bynk-blog.pages.dev
  UPSTREAM: string;
}

export const PREFIX = "/blog";

export async function handle(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);

  // `/blog` with no trailing slash: send the browser to `/blog/`, so relative
  // links on the home page resolve under /blog/.
  if (url.pathname === PREFIX) {
    url.pathname = `${PREFIX}/`;
    return Response.redirect(url.toString(), 308);
  }

  // The routes only send /blog and /blog/*, so anything else is a
  // misconfigured route rather than a page.
  if (!url.pathname.startsWith(`${PREFIX}/`)) {
    return new Response("Not found", { status: 404 });
  }

  // Build the target by appending the path to the upstream's origin as text,
  // never by resolving it as a reference: the rest of the path starts with `/`,
  // so a rest of `//evil.example/x` would be a protocol-relative reference and
  // `new URL(rest, upstream)` would send the request, with the visitor's
  // headers, to evil.example. Appended to the origin, it stays a path on the
  // upstream. The origin check below is a second line of defence.
  const upstream = new URL(env.UPSTREAM);
  const target = new URL(upstream.origin + url.pathname.slice(PREFIX.length) + url.search);
  if (target.origin !== upstream.origin) {
    return new Response("Not found", { status: 404 });
  }

  // The same method, headers and body, sent to the Pages project. Redirects
  // come back to us rather than being followed, so they can be rewritten.
  const response = await fetch(new Request(target, request), { redirect: "manual" });

  const location = response.headers.get("location");
  if (location === null) return response;

  // Pages answers `/posts/x` with a redirect to `/posts/x/`, relative to its
  // own origin. Put the prefix back, keeping the browser on bynk-lang.org.
  const resolved = new URL(location, target);
  if (resolved.origin !== upstream.origin) return response;

  const headers = new Headers(response.headers);
  headers.set("location", `${PREFIX}${resolved.pathname}${resolved.search}${resolved.hash}`);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default { fetch: handle };
