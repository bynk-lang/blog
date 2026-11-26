import { afterEach, describe, it, mock } from "node:test";
import assert from "node:assert/strict";

import { handle } from "../src/index.ts";

const env = { UPSTREAM: "https://bynk-blog.pages.dev" };

// Replace the global fetch with one that records the request it was given and
// answers with `answer`.
function upstream(answer: Response) {
  const seen: Request[] = [];
  mock.method(globalThis, "fetch", async (input: Request, init?: RequestInit) => {
    seen.push(new Request(input, init));
    return answer;
  });
  return seen;
}

afterEach(() => mock.restoreAll());

describe("the /blog proxy", () => {
  it("fetches the same path from the Pages project, without the prefix", async () => {
    const seen = upstream(new Response("<html>", { headers: { "content-type": "text/html" } }));
    const res = await handle(new Request("https://bynk-lang.org/blog/posts/money/?ref=x"), env);
    assert.equal(seen[0].url, "https://bynk-blog.pages.dev/posts/money/?ref=x");
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("content-type"), "text/html");
    assert.equal(await res.text(), "<html>");
  });

  it("serves the blog's home page at /blog/", async () => {
    const seen = upstream(new Response("home"));
    await handle(new Request("https://bynk-lang.org/blog/"), env);
    assert.equal(seen[0].url, "https://bynk-blog.pages.dev/");
  });

  it("passes the method, headers and status through", async () => {
    const seen = upstream(new Response(null, { status: 304, headers: { etag: '"abc"' } }));
    const res = await handle(
      new Request("https://bynk-lang.org/blog/_astro/site.css", {
        method: "HEAD",
        headers: { "if-none-match": '"abc"' },
      }),
      env,
    );
    assert.equal(seen[0].method, "HEAD");
    assert.equal(seen[0].headers.get("if-none-match"), '"abc"');
    assert.equal(res.status, 304);
    assert.equal(res.headers.get("etag"), '"abc"');
  });

  it("passes a 404 from the Pages project through", async () => {
    upstream(new Response("not here", { status: 404 }));
    const res = await handle(new Request("https://bynk-lang.org/blog/nope/"), env);
    assert.equal(res.status, 404);
    assert.equal(await res.text(), "not here");
  });

  it("asks for redirects to come back rather than be followed", async () => {
    const seen = upstream(new Response("ok"));
    await handle(new Request("https://bynk-lang.org/blog/posts/"), env);
    assert.equal(seen[0].redirect, "manual");
  });

  it("puts the prefix back on a redirect within the Pages project", async () => {
    upstream(new Response(null, { status: 308, headers: { location: "/posts/money/" } }));
    const res = await handle(new Request("https://bynk-lang.org/blog/posts/money"), env);
    assert.equal(res.status, 308);
    assert.equal(res.headers.get("location"), "/blog/posts/money/");
  });

  it("rewrites an absolute redirect to the Pages project too", async () => {
    upstream(new Response(null, { status: 301, headers: { location: "https://bynk-blog.pages.dev/posts/?page=2" } }));
    const res = await handle(new Request("https://bynk-lang.org/blog/posts"), env);
    assert.equal(res.headers.get("location"), "/blog/posts/?page=2");
  });

  it("leaves a redirect to another site alone", async () => {
    upstream(new Response(null, { status: 302, headers: { location: "https://github.com/bynk-lang/blog" } }));
    const res = await handle(new Request("https://bynk-lang.org/blog/source/"), env);
    assert.equal(res.headers.get("location"), "https://github.com/bynk-lang/blog");
  });

  it("redirects /blog to /blog/, keeping the query", async () => {
    const res = await handle(new Request("https://bynk-lang.org/blog?ref=x"), env);
    assert.equal(res.status, 308);
    assert.equal(res.headers.get("location"), "https://bynk-lang.org/blog/?ref=x");
  });

  it("keeps a path that starts with // on the Pages project", async () => {
    const seen = upstream(new Response("ok"));
    await handle(new Request("https://bynk-lang.org/blog//evil.example/x?y=1"), env);
    assert.equal(seen.length, 1);
    assert.equal(new URL(seen[0].url).origin, "https://bynk-blog.pages.dev");
    assert.equal(seen[0].url, "https://bynk-blog.pages.dev//evil.example/x?y=1");
  });

  it("keeps a path with a backslash on the Pages project", async () => {
    const seen = upstream(new Response("ok"));
    await handle(new Request("https://bynk-lang.org/blog/\\evil.example/x"), env);
    assert.equal(seen.length, 1);
    assert.equal(new URL(seen[0].url).origin, "https://bynk-blog.pages.dev");
    assert.equal(seen[0].url, "https://bynk-blog.pages.dev//evil.example/x");
  });

  it("refuses a path outside /blog/", async () => {
    const res = await handle(new Request("https://bynk-lang.org/blogroll"), env);
    assert.equal(res.status, 404);
  });
});
