/**
 * Renders the static hero artwork committed at public/brand/hero-eyewear.webp.
 *
 * The hero previously showed a card reading "REAL PRODUCT ASSET PENDING CMS",
 * which was honest but left the most prominent slot on the site empty. This is
 * decorative brand art rather than a product photograph, so it carries no
 * placeholder stamp and makes no claim about any item: AGENTS.md constrains what
 * a *product* photo may show, and permits editorial imagery.
 *
 * Run from apps/web when the artwork changes:
 *   node scripts/render-brand-art.mjs
 */

import { writeFile } from "node:fs/promises";

import sharp from "sharp";

const WIDTH = 1200;
const HEIGHT = 800;

const GOLD = "#fecc29";
const OBSIDIAN = "#151515";
const PORCELAIN = "#f7f4ed";
const BRASS = "#a8792a";

/** A pair of round frames, drawn a little larger than life for the hero. */
function frames(cx, cy, scale) {
  const lens = 150 * scale;
  const gap = 190 * scale;
  const stroke = 18 * scale;

  return `
    <g stroke-linecap="round" stroke-linejoin="round" fill="none"
       stroke="${OBSIDIAN}" stroke-width="${stroke}">
      <circle cx="${cx - gap}" cy="${cy}" r="${lens}" fill="${GOLD}" fill-opacity="0.20"/>
      <circle cx="${cx + gap}" cy="${cy}" r="${lens}" fill="${GOLD}" fill-opacity="0.20"/>
      <path d="M ${cx - gap + lens} ${cy - 18 * scale}
               Q ${cx} ${cy - 70 * scale} ${cx + gap - lens} ${cy - 18 * scale}"/>
      <path d="M ${cx - gap - lens} ${cy - 30 * scale}
               L ${cx - gap - lens - 130 * scale} ${cy - 78 * scale}"/>
      <path d="M ${cx + gap + lens} ${cy - 30 * scale}
               L ${cx + gap + lens + 130 * scale} ${cy - 78 * scale}"/>
    </g>
    <circle cx="${cx}" cy="${cy - 52 * scale}" r="${11 * scale}" fill="${BRASS}"/>
  `;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <radialGradient id="glow" cx="50%" cy="45%" r="60%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="${PORCELAIN}" stop-opacity="1"/>
    </radialGradient>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow)"/>

  <!-- Orbit motif, echoing the brand mark without competing with the product. -->
  <circle cx="${WIDTH / 2}" cy="${HEIGHT / 2}" r="330" fill="none"
          stroke="${GOLD}" stroke-width="3" opacity="0.55"/>
  <circle cx="${WIDTH / 2}" cy="${HEIGHT / 2}" r="330" fill="none"
          stroke="${GOLD}" stroke-width="16" opacity="0.28"
          stroke-dasharray="90 1980" stroke-linecap="round"
          transform="rotate(-40 ${WIDTH / 2} ${HEIGHT / 2})"/>
  <circle cx="${WIDTH / 2}" cy="${HEIGHT / 2}" r="248" fill="none"
          stroke="${BRASS}" stroke-width="2" opacity="0.35"/>

  <ellipse cx="${WIDTH / 2}" cy="${HEIGHT / 2 + 168}" rx="252" ry="26"
           fill="${OBSIDIAN}" opacity="0.10"/>

  ${frames(WIDTH / 2, HEIGHT / 2, 1)}

  <circle cx="${WIDTH / 2 - 372}" cy="${HEIGHT / 2 - 214}" r="9" fill="${GOLD}"/>
  <circle cx="${WIDTH / 2 + 336}" cy="${HEIGHT / 2 + 206}" r="7" fill="${BRASS}" opacity="0.8"/>
</svg>`;

const output = await sharp(Buffer.from(svg), { density: 144 })
  .resize({ height: HEIGHT, width: WIDTH })
  .webp({ effort: 6, quality: 88 })
  .toBuffer();

await writeFile("public/brand/hero-eyewear.webp", output);

console.log(
  `wrote public/brand/hero-eyewear.webp (${Math.round(output.byteLength / 1024)} kB)`,
);
