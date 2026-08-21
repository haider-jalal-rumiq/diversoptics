# Reference Map — Video Reconstruction (internal tool)

Source: supplied 21 s walkthrough video, 1920×1080 @ 60 fps.
Frames analyzed: 21 @ 1 fps + 21 extra @ 0.5 s windows + 4 zoom crops (header, mini-card, collections head, campaign text).

## Global design system

- **Two tonal worlds**: near-black `#06060a` (Home, Campaign) ↔ warm ivory `#f6ebd7` (Atelier). Gold/brown accents inside imagery.
- **Display type**: high-contrast Didone serif (≈ Bodoni). Used for: giant outlined viewport-width words (stroke-only, transparent fill, ~2 px stroke @1920), section headings (solid), italic accents, card names, italic stat.
- **UI type**: neutral grotesque, tracked uppercase for nav/labels (~12–13 px, ls ≈ 0.18em), regular for paragraphs (~15 px). Campaign titles = **bold grotesque caps** (deliberate contrast vs serif).
- **Header** (fixed, both themes): two-line brand top-left (brand caps ~20 px + descriptor tiny tracked caps under), two nav links top-right (`COLLECTIONS`, `CAMPAIGN`), padding ≈ 40 px sides / 28 px top.
- **Footer word panel** (both themes): viewport-height panel, giant outlined word centered (`ELEVATE`), bottom row `© 2025 …` left, `INSTAGRAM PINTEREST` right.
- **Rounded media**: cards/thumbs radius ≈ 12–16 px.

## View 1 — HOME (dark)

1. **Hero carousel** (100 vh, 3 slides, auto ~3.5 s)
   - Full-bleed cinematic photo; subject lit top-center, negative space lower half.
   - Giant outlined brand word spanning ~86 % width, baseline ≈ 88 % vh; tracked descriptor caps centered below (~93 % vh).
   - **Transition = vertical roll**: image+title block translateY up, incoming from below (~0.9 s); both visible mid-roll.
   - Bottom-left mini-card: portrait thumb (~170×230, r≈14) + index badge `01` top-right chip; thumb follows slide.
   - Bottom-right: `(03)` + tracked caps label `CRAFTED ELEGANCE`.
2. **Collections** (dark, pad ≈ 18 vh top)
   - Centered: tiny tracked caps `CURATED LINES` over solid serif `COLLECTIONS` (~clamp 90–120 px).
   - Circular outline button (≈64 px, thin border, ↗ arrow) at right edge, heading baseline.
   - 3 cards, gap ≈ 40 px: image 3:4 r≈14 → meta: `01` tiny caps, name serif caps (~24 px), tagline tiny tracked caps gray, season italic serif gray.
   - Reveal: stagger 0.12 s, y+40→0, opacity, ease out.
3. **Footer word panel**: outlined `ELEVATE` (dark theme).

## View 2 — ATELIER (light)

1. **Hero** (100 vh, ivory)
   - Left mid (~45 % vh): two-line tiny tracked caps statement `BEHIND EVERY SEAM / LIES INTENTION`.
   - Giant outlined `ATELIER` bottom (same metrics as home hero).
   - Bottom-right inline mini-card (portrait, `02` badge): images crossfade every ~3 s.
2. **Hands split** (pad ≈ 16 vh)
   - Left col ~38 % (sticky feel): stacked heading — `THE` tiny caps / `HANDS` italic serif huge / `BEHIND THE` caps / `CRAFT` serif huge; paragraph (~420 px max); link `EXPLORE THE ATELIER ↗` tracked caps.
   - Right col: 2×3 image grid, gap ≈ 24 px, portrait cells.
3. **Editorial banner**: full-bleed image ≈ 85 vh, parallax + scale reveal.
4. **Crafted in detail** (3 col)
   - Left: tall portrait image (~30 % w). Center: detail card (square image + caption `PRECISION PLEATING / …`) sitting lower. Right: tracked caps head `FROM SKETCH TO SILHOUETTE`, paragraph, italic serif stat `200+ HOURS PER GARMENT`.
5. **Footer word panel**: outlined `ELEVATE` (light theme).

## View 3 — CAMPAIGN (dark)

1. **Hero** (100 vh): giant outlined `CAMPAIGN` (same metrics); bottom-left landscape card (`CAMPAIGN 01` + name); bottom-right square next-thumb (`02` badge).
2. **Detail slider** (min 100 vh, auto ~4.5 s, crossfade)
   - Left image ~43 % w, near-square portrait, r≈14.
   - Right col: `CAMPAIGN 01` tracked tiny gray → name bold grotesque caps ~48 px → paragraph → link `EXPLORE CAMPAIGN ↗`.
   - Bottom-right: next-campaign thumb + `CAMPAIGN 0X` label (click = advance).
   - 3 campaigns cycle; text block rolls vertically on change.

## View transitions

- **Vertical page roll**: outgoing view translateY 0→−100 vh while incoming 100 vh→0, ~1.1 s power2.inOut, simultaneous; giant outlined words of both views sweep through frame. Scroll resets to top of incoming view.

## Brand adaptation (allowed substitutions only)

- Industry: couture fashion → **haute horlogerie** (fictional **VELMONT Horlogerie**).
- `ÉLYSÉE / ATELIER` → `VELMONT / HORLOGERIE`; footer word `ELEVATE` → `PRECISION`; `(03) CRAFTED ELEGANCE` → `(03) CRAFTED PRECISION`.
- Collections → calibres: `ARGENT LINE`, `NOIR CALIBRE`, `GOLDEN MERIDIAN` (season labels → `Calibre M-0x · 2026`).
- Campaigns: `STEEL & SHADOW`, `GOLDEN HOUR`, `ARGENT STRUCTURE`.
- Atelier copy maps 1:1 (`THE HANDS BEHIND THE CRAFT` kept — literal double meaning; `200+ HOURS PER CALIBRE`).
- ATELIER view access: home hero mini-card (reference nav unchanged — 2 links). Documented deviation.
- All imagery replaced with original generated watchmaking editorial photography; tonal balance (dark↔ivory, gold accents) preserved.
