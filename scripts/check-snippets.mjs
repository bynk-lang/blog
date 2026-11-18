#!/usr/bin/env node
// Holds every ```bynk block in a post to real, checked Bynk.
//
// A post names the bynk-lang/showcase project its code comes from in its
// `showcase` frontmatter field. Each ```bynk block in the post must then appear
// in that project's .bynk source as a run of consecutive lines (see
// `normalise` for what the comparison sets aside). The
// showcase's own CI runs `bynk fmt --check`, `bynk check` and `bynk test` on
// every project, and the org canary re-runs them on each Bynk release, so a
// snippet that matches is code that formats, compiles and is tested.
//
// When the showcase changes, a post that quoted the old code fails here, which
// is the signal to update the post.
//
// A post whose code comes from another bynk-lang repository instead, such as
// the starter template, names it in a `repo` field (`repo: starter`), and every
// ```bynk block must appear in that repository's .bynk source. The checkout is
// passed as `--repo starter=<dir>`.
//
// A block that is deliberately not from either (pseudo-code, or a
// counter-example that must not compile) opts out with `nocheck` in its fence:
// ```bynk nocheck
//
// Usage: node scripts/check-snippets.mjs [showcase-dir] [--repo name=dir ...]
//   showcase-dir defaults to $SHOWCASE_DIR, then ../showcase.

import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const postsDir = join(root, "src/content/docs/posts");
const args = process.argv.slice(2);
const repoDirs = new Map();
const positional = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--repo") {
    const [name, dir] = (args[++i] ?? "").split("=");
    if (!name || !dir) {
      console.error("--repo takes name=dir, such as --repo starter=../starter");
      process.exit(2);
    }
    repoDirs.set(name, resolve(dir));
  } else {
    positional.push(args[i]);
  }
}
const showcaseDir = resolve(positional[0] ?? process.env.SHOWCASE_DIR ?? join(root, "../showcase"));
const inActions = Boolean(process.env.GITHUB_ACTIONS);

let failures = 0;
let checked = 0;

function fail(file, line, message) {
  failures += 1;
  const path = relative(root, file);
  if (inActions) {
    console.log(`::error file=${path},line=${line}::${message}`);
  } else {
    console.error(`${path}:${line}: ${message}`);
  }
}

async function walk(dir, predicate) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(path, predicate)));
    else if (predicate(entry.name)) out.push(path);
  }
  return out;
}

// The frontmatter fields this script needs, read without a YAML dependency:
// each is a single `key: value` line.
function frontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const fields = {};
  if (!match) return fields;
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^(\w+):\s*(.*)$/);
    if (field) fields[field[1]] = field[2].replace(/^["']|["']$/g, "").trim();
  }
  return fields;
}

// Every fenced block whose language is `bynk`, with the line its body starts on.
function bynkBlocks(text) {
  const blocks = [];
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const open = lines[i].match(/^(\s*)(`{3,}|~{3,})\s*bynk\b(.*)$/);
    if (!open) continue;
    const fence = open[2];
    const meta = open[3];
    const body = [];
    let j = i + 1;
    while (j < lines.length && !lines[j].trimStart().startsWith(fence)) body.push(lines[j++]);
    blocks.push({ line: i + 2, body, skip: /\bnocheck\b/.test(meta) });
    i = j;
  }
  return blocks;
}

// Lines compared, with whitespace, blank lines and comments set aside: a post
// can dedent a snippet, and leave out the doc comments (`--- …`, or a block
// between two `---` lines) and `//` comments that sit between the lines it
// quotes.
function normalise(lines) {
  const out = [];
  let inDoc = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (line === "---") {
      inDoc = !inDoc;
      continue;
    }
    if (inDoc || line === "" || line.startsWith("--- ") || line.startsWith("//")) continue;
    out.push(line);
  }
  return out;
}

function containsRun(haystack, needle) {
  outer: for (let i = 0; i + needle.length <= haystack.length; i++) {
    for (let j = 0; j < needle.length; j++) {
      if (haystack[i + j] !== needle[j]) continue outer;
    }
    return true;
  }
  return false;
}

const sourceCache = new Map();
async function projectSources(project) {
  if (!sourceCache.has(project)) {
    const dir = join(showcaseDir, project);
    const exists = await stat(join(dir, "bynk.toml")).then(
      () => true,
      () => false,
    );
    const files = exists ? await walk(dir, (name) => name.endsWith(".bynk")) : null;
    const sources = files
      ? await Promise.all(files.map(async (f) => normalise((await readFile(f, "utf8")).split(/\r?\n/))))
      : null;
    sourceCache.set(project, sources);
  }
  return sourceCache.get(project);
}

const repoSourceCache = new Map();
async function repoSources(name) {
  if (!repoSourceCache.has(name)) {
    const dir = repoDirs.get(name);
    const files = dir ? await walk(dir, (n) => n.endsWith(".bynk")).catch(() => null) : null;
    const sources = files
      ? await Promise.all(files.map(async (f) => normalise((await readFile(f, "utf8")).split(/\r?\n/))))
      : null;
    repoSourceCache.set(name, sources);
  }
  return repoSourceCache.get(name);
}

const showcaseExists = await stat(join(showcaseDir, "bynk.toml")).then(
  () => true,
  () => false,
);
if (!showcaseExists) {
  console.error(`No showcase checkout at ${showcaseDir} (looked for its root bynk.toml).`);
  console.error("Clone bynk-lang/showcase there, or pass its path: node scripts/check-snippets.mjs <dir>");
  process.exit(2);
}

for (const post of await walk(postsDir, (name) => /\.mdx?$/.test(name))) {
  const text = await readFile(post, "utf8");
  const { showcase, repo } = frontmatter(text);
  const blocks = bynkBlocks(text).filter((block) => !block.skip);
  if (blocks.length === 0) continue;

  let sources;
  let where;
  if (repo) {
    where = `bynk-lang/${repo}`;
    sources = await repoSources(repo);
    if (!sources) {
      fail(post, 1, `no checkout of bynk-lang/${repo}: pass --repo ${repo}=<dir>`);
      continue;
    }
  } else if (showcase) {
    where = `showcase/${showcase}`;
    sources = await projectSources(showcase);
    if (!sources) {
      fail(post, 1, `showcase project \`${showcase}\` doesn't exist in bynk-lang/showcase`);
      continue;
    }
  } else {
    fail(post, 1, "this post has ```bynk blocks but no `showcase` or `repo` field to check them against (mark a block `nocheck` if it isn't from either)");
    continue;
  }

  for (const block of blocks) {
    checked += 1;
    const needle = normalise(block.body);
    if (!sources.some((source) => containsRun(source, needle))) {
      fail(post, block.line, `this \`\`\`bynk block isn't in ${where}: update it to match the source, or mark it \`nocheck\``);
    }
  }
}

if (failures > 0) {
  console.error(`\n${failures} snippet problem(s) found (${checked} block(s) checked).`);
  process.exit(1);
}
console.log(`All ${checked} Bynk block(s) match their sources.`);
