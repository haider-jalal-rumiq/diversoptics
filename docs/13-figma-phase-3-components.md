# Figma Phase 3 — component library

Status: Complete and validated on 2026-08-21.

Figma file: <https://www.figma.com/design/bTTNOsvFVrnoFczV6mFbeJ>

## Library coverage

- Six token-bound 24px line icons.
- Button: 30 variants.
- Text Link: 20 variants.
- Icon Button: 16 variants with icon swap and accessibility-label properties.
- Search: eight responsive state variants.
- Filter Chip: eight selection/state variants.
- WhatsApp CTA: 15 product, general and shortlist variants.
- Header: four desktop/mobile and default/scrolled variants using the supplied logo.
- Availability Badge: six CMS-driven tone/style variants.
- Product Card: six grid/list state variants plus a CMS media placeholder.
- Category Card: six compact/wide state variants plus a CMS category-media placeholder.
- Brand Tile: six light/dark state variants plus a rights-pending mark placeholder.
- Shortlist Tray: four desktop/mobile empty/filled variants.
- Orbit Hero: four desktop/mobile enhanced/reduced-motion variants plus a static scene fallback.

## Audit result

- 13 component sets.
- 133 variants with unique grid positions.
- 63 component properties.
- 57 local variables.
- 13 text styles and three effect styles.
- 143 total component nodes, including icons, helpers and variant children.
- 14 component documentation pages/statuses validated.
- Two explicit reduced-motion hero variants.
- No Phase 3 validation failures remain.

## Accuracy and content controls

- Product, model, brand, media and availability specimens are labelled placeholders.
- Product Cards omit price until client-supplied pricing and display policy are approved.
- Brand Tiles include an inventory and logo-usage-rights publishing gate.
- Availability badges map only from confirmed CMS values and do not infer quantity or urgency.
- WhatsApp components use the confirmed public destination `+92 333 5777710` and preserve product name, SKU/model, variant, URL and inquiry ID.
- The shortlist is the cart replacement; no component implies website payment or order confirmation.

## Motion and accessibility controls

- Interactive families include visible focus variants.
- Icon-only actions expose meaningful accessibility-label properties.
- Main touch targets meet or exceed 44px.
- Orbit Hero includes Enhanced and Reduced variants; mobile scene artwork is clipped to its responsive bounds.
- WebGL remains progressive enhancement with a static poster fallback and `prefers-reduced-motion` support.

## Visual-review corrections recorded

- Strengthened Button, Filter Chip and WhatsApp focus outlines.
- Corrected semantic paint fallbacks discovered in Filter Chip and Brand Tile screenshots.
- Fixed Header, Product Card, Shortlist and Orbit Hero responsive spacing.
- Corrected nested component default labels for availability, browse and shortlist actions.
- Added responsive media constraints and mini-thumbnail caption overrides.

## Next phase

Review and approve the completed Gate 3 sitemap, conversion flows and mobile wireframes, then compose high-fidelity responsive public screens from these validated components.
