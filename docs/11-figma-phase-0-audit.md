# Figma Phase 0 audit and scope lock

Date: 2026-08-21  
Status: Ready for project-owner approval before Figma foundations are created.  
Figma: <https://www.figma.com/design/bTTNOsvFVrnoFczV6mFbeJ>

## Confirmed design inputs

- Golden Orbit is the approved brand foundation.
- The current Diverso logo remains in use; a cleaner vector recreation and production exports are authorized.
- The website is a catalog and concierge experience with no online payment in MVP.
- Public WhatsApp: `+92 333 5777710`.
- Test-only number: `03438067821`; never publish it.
- Delivery is available, but coverage, cost, timing and COD rules remain open.
- Known launch structure:
  - Sunglasses: 10 brands × about 10 products = about 100.
  - Watches: 4 brands × about 5 products = about 20.
  - Optical frames: Men, Women and Kids.
  - Contact lenses: Transparent and Colored.
  - Pens: Montblanc named; count and inventory still open.

## Sources reviewed

### Supplied local references

- `../caliber/` — design-system specimen and watch landing template; inspected in source and rendered locally on 2026-08-21.
- `../velmont-code/` — Svelte cinematic horology landing page; inspected in source, at 1440 × 900 and 390 × 844, on 2026-08-21.
- `../diverso1.jpeg` and `../diverso2.jpeg` — supplied logo references.

### External and connected references

- [Gentle Monster sunglasses catalog](https://www.gentlemonster.com/us/en/category/sunglasses/view-all) — retrieved 2026-08-21.
- [Ace & Tate new collection](https://www.aceandtate.com/gb/glasses/new-collection) — retrieved 2026-08-21.
- [Baymard product lists and filtering research](https://baymard.com/research/ecommerce-product-lists) — retrieved 2026-08-21.
- [Baymard mobile product-list examples](https://baymard.com/mcommerce-usability/benchmark/mobile-page-types/product-list) — retrieved 2026-08-21.
- [web.dev performance guidance](https://web.dev/performance) — retrieved 2026-08-21.
- Figma Simple Design System — connected community library inspected for Buttons, Product/Card, Search, Filters, Navigation, spacing, radii and styles on 2026-08-21.

## Verified local-reference observations

### Caliber

Strengths to reuse:

- Token-first structure and disciplined semantic components.
- Compact 4 px spacing base, hairlines and restrained radii.
- High-contrast product presentation with one scarce accent.
- Functional patterns: filters, model cards, specs and clear calls to action.

Do not copy:

- Dark-only treatment; it conflicts with Golden Orbit's warm Porcelain catalog surface.
- Instrument Sans; Golden Orbit uses Instrument Serif and Manrope.
- Generic watch statistics and commerce language.

### Velmont

Strengths to reuse:

- Full-bleed cinematic hero with intentional negative space.
- Large outlined word treatment, alternating dark/ivory sections and editorial pacing.
- Reversible mask reveals, subtle parallax and fixed navigation that adapts to the section tone.
- Strong responsive handling and an explicit reduced-motion path.

Do not copy:

- The VELMONT word treatment, exact section composition, fictional claims or watch imagery.
- Bodoni Moda/Inter; the approved Golden Orbit pair wins.
- Auto-rotating content as the only way to access information.
- An 8,800 px storytelling page without stronger catalog entry points.

## External-research implications

- Gentle Monster proves that the editorial world and the product catalog can share one brand while keeping shop taxonomy direct.
- Ace & Tate demonstrates useful eyewear filters such as frame shape, width and color, supported by human imagery rather than a marketplace aesthetic.
- Baymard's product-list research supports category-specific filters, useful product information on list items, visible applied-filter state and special care on mobile where comparison is harder.
- The connected Simple Design System contains mature structural references, but its generic visual tokens and component APIs do not match Golden Orbit. Diverso should create local brand components while borrowing accessibility behavior and using reliable SVG icon patterns.
- Web performance guidance reinforces a poster-first experience and an optional 3D enhancement after the primary content rather than a WebGL-dependent first render.

## Recommended design thesis — Orbit Concierge

Diverso should feel like a cinematic local showroom that quickly becomes a useful catalog.

The signature visual is a precise golden orbit around one featured product. On capable devices the orbit has subtle depth and responds to pointer or device tilt. It shifts category context between eyewear, timepieces and writing instruments. On mobile, low-power and reduced-motion contexts, the exact same composition becomes a layered still or short optimized video.

The orbit is not a loading screen and does not control scrolling. The logo, headline, primary image, navigation and WhatsApp action remain usable before the enhancement loads.

## Homepage composition v1

1. Delivery/status bar using only confirmed, non-specific wording until terms are supplied.
2. Adaptive header with logo, Shop, Eyewear, Watches, Contact Lenses, Pens, Search, Shortlist and WhatsApp.
3. Cinematic Orbit Hero with one clearly labelled sample product, a direct catalog CTA and WhatsApp CTA.
4. Category Constellation: Sunglasses, Optical Frames, Contact Lenses, Watches and Pens.
5. Optical Frames gateway: Men, Women and Kids.
6. Curated product shelf with transparent price/availability placeholder states.
7. Guided frame discovery using shape, fit and style—not medical advice.
8. Contact-lens gateway for Transparent and Colored products with consultation language.
9. Objects of distinction editorial split for watches and pens.
10. F-11 store, delivery and human-service proof module; exact address/hours remain placeholders.
11. Shortlist explainer and WhatsApp handoff.
12. Footer with verified contact and policy links only.

## Responsive strategy

- First key frames: 390 × 844 mobile and 1440 × 900 desktop.
- Secondary validation: 360, 768, 1024 and 1280 px widths.
- Desktop hero may use interactive depth; mobile defaults to the static/poster experience until the code prototype proves the live scene is safe.
- Product grids: two columns on common mobile widths, three on tablet where content permits, four on desktop.
- Filters: explicit drawer with applied-filter summary on mobile; persistent or horizontal controls on desktop according to category depth.

## Planned Figma token architecture

### Collections

1. `Primitives` — one `Value` mode.
2. `Color` — `Light` and `Editorial` modes.
3. `Spacing` — one `Default` mode.
4. `Radius` — one `Default` mode.

### Core color primitives

- `gold/400` `#FFD95F`
- `gold/500` `#FECC29`
- `gold/600` `#E4B414`
- `gold/700` `#B98600`
- `neutral/0` `#FFFFFF`
- `porcelain/50` `#F7F4ED`
- `smoke/600` `#68635E`
- `obsidian/800` `#242321`
- `obsidian/900` `#151515`
- `brass/600` `#A8792A`
- `green/600` `#217A4B`
- `red/600` `#B42318`

Semantic colors will alias these primitives for page, surface, text, border, action, focus, availability and error roles. Components will not reference raw colors.

### Spacing and radius

- Spacing: `0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 120`.
- Radius: `0, 4, 8, 12, full`.

### Type styles

- Display: Instrument Serif at 104, 72 and 56.
- Headings: Instrument Serif at 48, 40, 32 and 24.
- Body: Manrope at 18, 16 and 14.
- Labels/product data: Manrope Medium/SemiBold at 14 and 12; functional UI will not use 12 px for essential content.

### Effect styles

- `shadow/subtle` for catalog elevation.
- `shadow/floating` for shortlist and media controls.
- `focus/gold` for visible keyboard focus documentation.

## First component scope

Dependency order:

1. Logo/lockup and orbit icon working assets.
2. Button and Text Link.
3. Icon Button.
4. Header/navigation shell.
5. Search field.
6. Filter Chip and applied-filter item.
7. WhatsApp CTA.
8. Product Card.
9. Category Card.
10. Brand Tile.
11. Availability/price treatment.
12. Shortlist Tray.
13. Orbit Hero shell with poster, loading, error and reduced-motion states.

The first responsive screen will use local components. Simple Design System assets remain references rather than detached or visually mismatched imports.

## Motion and 3D implementation guardrails

- One live canvas maximum on a route.
- Poster and semantic content are part of the initial render.
- Load the 3D package and model after the main content or explicit interaction.
- Cap device pixel ratio and pause rendering offscreen.
- Prefer render-on-demand over a permanent frame loop.
- Use an accurate real product asset when supplied; otherwise the Figma hero uses a labelled abstract/sample object.
- Product cards use optimized still images only.
- Reduced motion receives no orbit rotation, parallax or autoplay.
- Prototype normal, reduced-motion, loading, low-power and failure states.

## Gap analysis

| Area | Code/reference state | Figma state | Resolution |
|---|---|---|---|
| Brand tokens | Caliber and Velmont have incompatible dark palettes | New file has no local variables | Create Golden Orbit primitives and semantic modes locally |
| Typography | Caliber uses Instrument Sans; Velmont uses Bodoni Moda/Inter | Instrument Serif and Manrope are available | Approved Golden Orbit fonts win |
| Components | Reference implementations exist but are not Diverso components | Only remote Simple Design System library is available | Build local, token-bound components; borrow behavioral patterns only |
| Layout | Velmont is cinematic; Caliber is functional | No screens exist | Combine cinematic entry with fast catalog sections; do not clone either layout |
| Images | Reference images are fictional and unrelated | No client product imagery in Figma | Use labelled placeholders until real inventory/photos arrive |
| 3D | Desired, but no accurate Diverso product model exists | No 3D asset | Prototype a shell and static poster; code spike only after a real source asset is chosen |
| Commerce | References assume product sales or fictional storytelling | Diverso requires assisted commerce | Use Ask on WhatsApp and Shortlist; no checkout/cart/payment |

## Remaining inputs

These do not block foundation or wireframe work, but they block final content approval:

- Exact shop address/map pin, opening hours, email and public phone if different from WhatsApp.
- Delivery coverage, cost, timing, COD and policy wording.
- The ten sunglasses brands, four watch brands and actual product inventory.
- Representative real product names, images, prices and availability states.
- Price-display rule.
- Written warranty, return/exchange and authenticity language.
- Confirmation that “three optical-frame articles” means the Men/Women/Kids subcategories rather than three editorial articles.

## Excluded from v1

- Online payment and checkout.
- Full virtual try-on.
- 3D or WebGL on every product card.
- Scroll hijacking and mandatory animated intros.
- Unverified brand, authenticity, delivery, medical, warranty or stock claims.

## Approval requested

Approve this Phase 0 scope to begin Figma Phase 1: Golden Orbit variables, type/effect styles and working logo assets, followed by foundation pages and the first mobile/desktop homepage system.
