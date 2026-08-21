# VELMONT Horlogerie

A cinematic, scroll-driven landing experience for **Velmont Horlogerie**, a
fictional independent watchmaking atelier. Three views — Home (dark), Atelier
(light), and Campaign (dark) — connected by full-page vertical roll
transitions, with an auto-rotating hero, staggered editorial reveals, and a
campaign slider.

Velmont is a fictional portfolio concept. It does not sell watches, take
orders, or claim real-world presence.

## Stack

- SvelteKit 5 (adapter-static, SPA fallback)
- Tailwind CSS 4 (theme tokens) + custom CSS
- GSAP + ScrollTrigger (view rolls, reveals, parallax)
- Self-hosted variable fonts: Bodoni Moda + Inter
- Original generated editorial imagery (local WebP)

## Local development

```bash
pnpm install
pnpm dev
```

Run all repository checks:

```bash
pnpm validate   # svelte-check + node tests + production build
```

## Production build & deploy

```bash
pnpm build      # outputs static site to build/
```

The included `Dockerfile` builds the site and serves `build/` through nginx
(SPA fallback). Deploy by pushing to `main` on the connected Dokploy app.

## Where things live

- **Brand copy & content**: `src/lib/content.js` — all names, copy, image
  paths, and timing tokens. Edit here to re-skin the brand.
- **Motion configuration**: `src/lib/motion.js` (GSAP helpers, reveal and
  parallax actions) and the `motion` export in `content.js` (durations).
- **Views**: `src/lib/views/{HomeView,AtelierView,CampaignView}.svelte`.
- **View roll transition**: `src/routes/+page.svelte`.
- **Replaceable brand assets**: `static/assets/*.webp` (imagery),
  `static/fonts/*.woff2` (self-hosted fonts).

## Implementation summary

Reference structure preserved: dark home with 3-slide rolling hero, giant
outlined display word + tracked descriptor, bottom-left mini-card and
bottom-right count label; collections trio with circular arrow CTA;
viewport-height outlined footer word; light atelier with hero statement,
hands split section, full-bleed parallax banner, crafted-in-detail three
column layout; dark campaign view with outlined hero word, dual corner cards,
and an auto-advancing detail slider. Views transition with a vertical
full-page roll.

Fictional brand: **Velmont Horlogerie** — haute horlogerie (watchmaking),
chosen because the reference's craft narrative ("hands behind the craft",
"200+ hours per piece", detail macro photography) maps 1:1 onto watchmaking
while being a clearly different industry from the reference's couture
fashion.

Intentional deviations (minimal):

- The atelier view is reachable through the home hero mini-card (reference
  navigation shows only two links; documented in `REFERENCE_MAP.md`).
- Footer word `ELEVATE` became `PRECISION` to fit the watchmaking voice while
  keeping the same tonal role.
- Season labels on collection cards became calibre references
  (`Calibre M-0x · 2026`).

Accessibility: semantic landmarks, keyboard-operable controls, visible focus,
`prefers-reduced-motion` disables auto-rotation, rolls, and parallax, and all
imagery carries meaningful alt text.
