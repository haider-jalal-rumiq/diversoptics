/**
 * Draws Golden Orbit placeholder product artwork as SVG, for the preview catalog.
 *
 * Photographic stock was rejected: search results for eyewear and watches are
 * dominated by lifestyle shots of identifiable people, and using someone's face
 * to sell a product is a personality-rights problem the Unsplash licence does
 * not cover. Generated photography would have to be paid for out of the account's
 * credits. Drawing the artwork costs nothing, contains no people, and carries no
 * licence at all.
 *
 * Each image is deliberately marked as a placeholder. These sit in a live
 * database, and an illustration that could be mistaken for a real product
 * photograph would breach the AGENTS.md rule that a product photo must show the
 * real item.
 */

const PALETTE = {
  brass: "#a8792a",
  charcoal: "#242321",
  gold: "#fecc29",
  obsidian: "#151515",
  porcelain: "#f7f4ed",
  smoke: "#68635e",
  white: "#ffffff",
};

const SIZE = 1800;

function escapeText(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Orbit motif reused across the brand, kept faint so the product reads first. */
function backdrop(accent) {
  return `
    <rect width="${SIZE}" height="${SIZE}" fill="${PALETTE.porcelain}"/>
    <circle cx="${SIZE / 2}" cy="${SIZE / 2}" r="620" fill="none"
            stroke="${accent}" stroke-width="3" opacity="0.30"/>
    <circle cx="${SIZE / 2}" cy="${SIZE / 2}" r="470" fill="${PALETTE.white}" opacity="0.55"/>
    <circle cx="${SIZE / 2}" cy="${SIZE / 2}" r="620" fill="none"
            stroke="${accent}" stroke-width="18" opacity="0.16"
            stroke-dasharray="60 1900" stroke-linecap="round"
            transform="rotate(-35 ${SIZE / 2} ${SIZE / 2})"/>
  `;
}

function caption(title, subtitle) {
  return `
    <text x="${SIZE / 2}" y="${SIZE - 250}" text-anchor="middle"
          font-family="Helvetica, Arial, sans-serif" font-size="58"
          font-weight="600" letter-spacing="6" fill="${PALETTE.obsidian}">
      ${escapeText(title.toUpperCase())}
    </text>
    <text x="${SIZE / 2}" y="${SIZE - 176}" text-anchor="middle"
          font-family="Helvetica, Arial, sans-serif" font-size="40"
          letter-spacing="4" fill="${PALETTE.smoke}">
      ${escapeText(subtitle)}
    </text>
    <text x="${SIZE / 2}" y="${SIZE - 92}" text-anchor="middle"
          font-family="Helvetica, Arial, sans-serif" font-size="32"
          font-weight="600" letter-spacing="8" fill="${PALETTE.smoke}" opacity="0.75">
      PLACEHOLDER IMAGE
    </text>
  `;
}

/** Lens outlines per frame silhouette, drawn around a shared centre line. */
function lensPath(shape, cx, cy, accent, lensFill, lensOpacity) {
  const common = `fill="${lensFill}" fill-opacity="${lensOpacity}" stroke="${PALETTE.obsidian}" stroke-width="16"`;

  switch (shape) {
    case "square":
      return `<rect x="${cx - 210}" y="${cy - 150}" width="420" height="300" rx="46" ${common}/>`;
    case "rectangular":
      return `<rect x="${cx - 220}" y="${cy - 118}" width="440" height="236" rx="34" ${common}/>`;
    case "aviator":
      return `<path d="M ${cx - 220} ${cy - 130} H ${cx + 220} L ${cx + 120} ${cy + 170}
              Q ${cx} ${cy + 230} ${cx - 120} ${cy + 170} Z" ${common}/>`;
    case "wayfarer":
      return `<path d="M ${cx - 220} ${cy - 140} H ${cx + 220} L ${cx + 170} ${cy + 150}
              Q ${cx} ${cy + 200} ${cx - 170} ${cy + 150} Z" ${common}/>`;
    case "cat-eye":
      return `<path d="M ${cx - 230} ${cy - 60} Q ${cx - 200} ${cy - 200} ${cx + 40} ${cy - 175}
              Q ${cx + 230} ${cy - 150} ${cx + 215} ${cy + 20}
              Q ${cx + 150} ${cy + 175} ${cx - 40} ${cy + 160}
              Q ${cx - 220} ${cy + 130} ${cx - 230} ${cy - 60} Z" ${common}/>`;
    case "sport":
      return `<path d="M ${cx - 250} ${cy - 120} Q ${cx} ${cy - 190} ${cx + 250} ${cy - 120}
              L ${cx + 215} ${cy + 140} Q ${cx} ${cy + 205} ${cx - 215} ${cy + 140} Z" ${common}/>`;
    case "oval":
      return `<ellipse cx="${cx}" cy="${cy}" rx="215" ry="140" ${common}/>`;
    default:
      return `<circle cx="${cx}" cy="${cy}" r="180" ${common}/>`;
  }
}

function eyewear({ accent, shape, tinted }) {
  const cy = 820;
  const left = 640;
  const right = 1160;
  const lensFill = tinted ? PALETTE.charcoal : accent;
  const lensOpacity = tinted ? 0.82 : 0.18;

  return `
    <g stroke-linecap="round" stroke-linejoin="round">
      <path d="M ${left + 200} ${cy - 40} Q ${SIZE / 2} ${cy - 110} ${right - 200} ${cy - 40}"
            fill="none" stroke="${PALETTE.obsidian}" stroke-width="20"/>
      <path d="M ${left - 215} ${cy - 60} L ${left - 350} ${cy - 130} L ${left - 400} ${cy + 130}"
            fill="none" stroke="${PALETTE.obsidian}" stroke-width="18"/>
      <path d="M ${right + 215} ${cy - 60} L ${right + 350} ${cy - 130} L ${right + 400} ${cy + 130}"
            fill="none" stroke="${PALETTE.obsidian}" stroke-width="18"/>
      ${lensPath(shape, left, cy, accent, lensFill, lensOpacity)}
      ${lensPath(shape, right, cy, accent, lensFill, lensOpacity)}
      <circle cx="${SIZE / 2}" cy="${cy - 96}" r="14" fill="${accent}"/>
    </g>
  `;
}

function lens({ accent, tint }) {
  const cy = 820;

  return `
    <g>
      <circle cx="${SIZE / 2}" cy="${cy}" r="330" fill="${tint}" fill-opacity="0.30"
              stroke="${PALETTE.obsidian}" stroke-width="18"/>
      <circle cx="${SIZE / 2}" cy="${cy}" r="252" fill="none" stroke="${accent}"
              stroke-width="10" opacity="0.75"/>
      <path d="M ${SIZE / 2 - 190} ${cy + 90} Q ${SIZE / 2 - 60} ${cy - 170} ${SIZE / 2 + 130} ${cy - 210}"
            fill="none" stroke="${PALETTE.white}" stroke-width="34" stroke-linecap="round" opacity="0.85"/>
      <path d="M ${SIZE / 2 - 120} ${cy + 190} Q ${SIZE / 2 - 20} ${cy + 60} ${SIZE / 2 + 150} ${cy + 20}"
            fill="none" stroke="${PALETTE.white}" stroke-width="18" stroke-linecap="round" opacity="0.55"/>
    </g>
  `;
}

function watch({ accent, dial, strap }) {
  const cy = 800;
  const isBracelet = strap === "bracelet";

  const band = isBracelet
    ? [0, 1, 2, 3]
        .map(
          (row) => `
          <rect x="${SIZE / 2 - 120}" y="${cy - 560 + row * 82}" width="240" height="62" rx="20"
                fill="${PALETTE.charcoal}" opacity="${0.55 + row * 0.1}"/>
          <rect x="${SIZE / 2 - 120}" y="${cy + 300 + row * 82}" width="240" height="62" rx="20"
                fill="${PALETTE.charcoal}" opacity="${0.85 - row * 0.1}"/>`,
        )
        .join("")
    : `
      <path d="M ${SIZE / 2 - 105} ${cy - 300} L ${SIZE / 2 - 130} ${cy - 620}
               Q ${SIZE / 2} ${cy - 690} ${SIZE / 2 + 130} ${cy - 620}
               L ${SIZE / 2 + 105} ${cy - 300} Z" fill="${PALETTE.brass}" opacity="0.85"/>
      <path d="M ${SIZE / 2 - 105} ${cy + 300} L ${SIZE / 2 - 130} ${cy + 620}
               Q ${SIZE / 2} ${cy + 690} ${SIZE / 2 + 130} ${cy + 620}
               L ${SIZE / 2 + 105} ${cy + 300} Z" fill="${PALETTE.brass}" opacity="0.85"/>`;

  return `
    <g>
      ${band}
      <circle cx="${SIZE / 2}" cy="${cy}" r="322" fill="${PALETTE.charcoal}"/>
      <circle cx="${SIZE / 2}" cy="${cy}" r="292" fill="${dial}"/>
      <circle cx="${SIZE / 2}" cy="${cy}" r="292" fill="none" stroke="${accent}" stroke-width="8" opacity="0.8"/>
      <rect x="${SIZE / 2 + 316}" y="${cy - 34}" width="46" height="68" rx="16" fill="${PALETTE.charcoal}"/>
      ${[0, 3, 6, 9]
        .map((hour) => {
          const angle = (hour / 12) * Math.PI * 2 - Math.PI / 2;
          const x1 = SIZE / 2 + Math.cos(angle) * 232;
          const y1 = cy + Math.sin(angle) * 232;
          const x2 = SIZE / 2 + Math.cos(angle) * 268;
          const y2 = cy + Math.sin(angle) * 268;
          return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${accent}" stroke-width="16" stroke-linecap="round"/>`;
        })
        .join("")}
      <line x1="${SIZE / 2}" y1="${cy}" x2="${SIZE / 2}" y2="${cy - 170}"
            stroke="${PALETTE.porcelain}" stroke-width="18" stroke-linecap="round"/>
      <line x1="${SIZE / 2}" y1="${cy}" x2="${SIZE / 2 + 130}" y2="${cy + 66}"
            stroke="${PALETTE.porcelain}" stroke-width="14" stroke-linecap="round"/>
      <circle cx="${SIZE / 2}" cy="${cy}" r="18" fill="${accent}"/>
    </g>
  `;
}

function pen({ accent, body, nib, pair }) {
  function barrel(cx, rotation) {
    return `
      <g transform="rotate(${rotation} ${cx} 820)">
        <rect x="${cx - 46}" y="380" width="92" height="700" rx="46" fill="${body}"/>
        <rect x="${cx - 46}" y="380" width="92" height="700" rx="46" fill="none"
              stroke="${PALETTE.obsidian}" stroke-width="8" opacity="0.35"/>
        <rect x="${cx - 46}" y="700" width="92" height="46" fill="${accent}" opacity="0.9"/>
        <rect x="${cx + 20} " y="430" width="20" height="230" rx="10" fill="${accent}"/>
        ${
          nib === "fountain"
            ? `<path d="M ${cx - 44} 380 Q ${cx} 250 ${cx + 44} 380 Z" fill="${PALETTE.gold}"/>
               <line x1="${cx}" y1="300" x2="${cx}" y2="372" stroke="${PALETTE.charcoal}" stroke-width="8"/>`
            : `<path d="M ${cx - 40} 380 L ${cx} 292 L ${cx + 40} 380 Z" fill="${PALETTE.charcoal}"/>`
        }
        <rect x="${cx - 46}" y="1052" width="92" height="34" rx="16" fill="${accent}" opacity="0.9"/>
      </g>
    `;
  }

  return pair
    ? `<g>${barrel(SIZE / 2 - 170, -9)}${barrel(SIZE / 2 + 170, 9)}</g>`
    : `<g>${barrel(SIZE / 2, 0)}</g>`;
}

const DRAWINGS = {
  eyewear,
  lens,
  pen,
  watch,
};

/**
 * Returns an SVG string for one product.
 *
 * `art` selects the drawing and its variation, so every product in the preview
 * catalog gets a visibly different image rather than one shared graphic.
 */
export function renderPlaceholderSvg({ art, subtitle, title }) {
  const draw = DRAWINGS[art.kind];

  if (!draw) throw new Error(`Unknown artwork kind: ${art.kind}`);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  ${backdrop(art.accent ?? PALETTE.gold)}
  ${draw({ accent: PALETTE.gold, ...art })}
  ${caption(title, subtitle)}
</svg>`;
}

export { PALETTE };
