// The social preview card for a page: a 1200×630 PNG with the post's series,
// its title and who it is written for, on the brand's dark ground with the
// Bynk mark. Links shared on LinkedIn, Mastodon or Slack show it
// (src/pages/og/, src/routeData.ts).
//
// The card is drawn as SVG and rasterised with sharp, so it needs no browser.
// SVG text does not wrap, so the title is broken into lines here, by an
// estimate of the average character width. The text is set in the first face
// of the stack the build machine has: Instrument Sans, as the site, where it
// is installed, but a GitHub runner usually has only DejaVu Sans, the widest
// face in the stack. The estimate is DejaVu Sans Bold's, so a title fits in
// any of them; in a narrower face its lines are just a little shorter.
import sharp from "sharp";

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

// The design system's dark theme (@bynk-lang/site-theme, tokens.css).
const GROUND = "#0e1513";
const INK = "#e8efe9";
const MUTED = "#9fb0a8";
const BRAND = "#f2b134";
const ACCENT = "#3cc4a6";
const FONT = "'Instrument Sans', Inter, 'DejaVu Sans', 'Liberation Sans', Arial, sans-serif";

const PAD = 80;
/** DejaVu Sans Bold's average character width, in ems, for mixed-case text. */
const CHAR_EM = 0.64;

const escape = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Break `text` into lines of at most `max` characters, at spaces. */
function wrap(text: string, max: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    if (line && (line + " " + word).length > max) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** The title's lines and size: as large as fits in four lines. */
function fitTitle(title: string): { lines: string[]; size: number } {
  for (const size of [76, 68, 60, 52]) {
    const max = Math.floor((OG_WIDTH - 2 * PAD) / (size * CHAR_EM));
    const lines = wrap(title, max);
    if (lines.length <= 3 || (size === 52 && lines.length <= 4)) return { lines, size };
  }
  const lines = wrap(title, Math.floor((OG_WIDTH - 2 * PAD) / (52 * CHAR_EM)));
  return { lines: [...lines.slice(0, 3), `${lines[3]}…`], size: 52 };
}

export interface Card {
  /** The page's title. */
  title: string;
  /** Above the title: the post's series, or what the page is. */
  eyebrow?: string;
  /** Below the title: who the post is written for. */
  footnote?: string;
}

export function cardSvg({ title, eyebrow, footnote }: Card): string {
  const { lines, size } = fitTitle(title);
  const lineHeight = Math.round(size * 1.12);
  const titleTop = 290;
  const tspans = lines
    .map((l, i) => `<tspan x="${PAD}" y="${titleTop + i * lineHeight}">${escape(l)}</tspan>`)
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}">
  <rect width="100%" height="100%" fill="${GROUND}"/>
  <rect x="0" y="0" width="${OG_WIDTH}" height="8" fill="${BRAND}"/>
  <g transform="translate(${PAD} 72) scale(2.5)">
    <rect x="1" y="1" width="22" height="10" rx="3" fill="#f2b134"/>
    <rect x="1" y="13" width="10" height="10" rx="3" fill="#3cc4a6"/>
    <rect x="13.5" y="13.5" width="9" height="9" rx="2.5" fill="#1d2825" stroke="#5f7a70"/>
  </g>
  <text x="${PAD + 78}" y="120" font-family="${FONT}" font-size="44" font-weight="700" fill="${INK}">Bynk<tspan fill="${BRAND}">.</tspan><tspan dx="14" font-weight="500" fill="${MUTED}">Blog</tspan></text>
  ${eyebrow ? `<text x="${PAD}" y="${titleTop - size - 16}" font-family="${FONT}" font-size="30" font-weight="600" fill="${ACCENT}">${escape(eyebrow)}</text>` : ""}
  <text font-family="${FONT}" font-size="${size}" font-weight="700" fill="${INK}">${tspans}</text>
  <text x="${PAD}" y="${OG_HEIGHT - 64}" font-family="${FONT}" font-size="28" fill="${MUTED}">${escape(
    [footnote, "bynk-lang.org/blog"].filter(Boolean).join("  ·  "),
  )}</text>
</svg>`;
}

export async function cardPng(card: Card): Promise<Buffer> {
  return sharp(Buffer.from(cardSvg(card))).png().toBuffer();
}
