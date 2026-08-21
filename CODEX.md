# Codex context capsule

## Mission

Build Diverso Optics into a credible premium local retail brand: a visually distinctive catalog website, an easy product CMS, a human WhatsApp inquiry experience, and a sustainable Instagram/Facebook/TikTok content operation.

## Current state — 2026-08-21

- Workspace began with two JPEG logo variants and no codebase.
- Competitor and benchmark research is documented.
- Golden Orbit is selected and documented as the approved brand foundation.
- An eight-page Canva comparison deck is ready: [edit](https://www.canva.com/d/T9RgtTE6y_bU_bN) or [view](https://www.canva.com/d/ouTxcFjAEf1FolC).
- Website UX, architecture, Figma workflow, social strategy, launch calendar, and product-content standards are planned.
- A Figma design file has been created for discovery and the upcoming design-system build: <https://www.figma.com/design/bTTNOsvFVrnoFczV6mFbeJ>.
- Phase 0 is approved. Figma Phase 1 now contains four variable collections, 57 validated variables, 13 text styles, and three effect styles for Golden Orbit.
- Figma Phase 2 is complete: seven ordered pages, a branded cover, Getting Started guide, full token specimens, component index, and Utilities/logo-reference page have passed structural and screenshot review.
- Figma Phase 3 is complete: 13 component sets, 133 variants, 63 exposed component properties, four supporting media/mark components, six icons, and 143 total component nodes have passed structural and screenshot review.
- The component library includes responsive Header, Search, Filter Chip, WhatsApp CTA, Product Card, Category Card, Brand Tile, Availability Badge, Shortlist Tray, and an Orbit Hero with enhanced and reduced-motion variants.
- Gate 3 review artifacts are ready in Figma: a public sitemap, three core conversion flows, and six 390×844 mobile wireframes for Home, Catalog, Product, Shortlist, Store and WhatsApp transition.
- Gate 3 is approved by the project owner.
- Gate 4 high fidelity is approved: 16 responsive public screens/templates, six CMS screens, five motion/resilience storyboards, and a QA/approval board.
- Figma structural audits found no unfinished placeholders or missing fonts across the new public, CMS, motion and QA pages.
- The supplied logo JPEG is placed as the canonical reference. An orbital badge is explicitly marked as an unapproved digital-extension exploration.
- Phase 01 establishes the production Next.js 16/React 19 foundation in `apps/web`, the Golden Orbit home experience, typed preview fixtures, environment-safe WhatsApp routing, and automated quality gates.
- Supabase project `diversoptics` (`eevpaueawctcutxultpi`) is connected and healthy.
- Phase 02 implements six cloud migrations, generated database types, explicit grants/RLS, two Storage buckets, invite-only profile activation, transactional media/attribute functions, and the responsive owner CMS.
- CMS coverage includes products, variants, media optimization, brands, categories, structured attributes, collections, pages, CSV draft import, business settings, staff roles, product preview, and audit activity.
- Phase 02 verification currently passes 30 pgTAP assertions, the Supabase security advisor, strict application checks, production build, and cross-browser anonymous Auth/accessibility tests.
- No real catalog or staff identities were seeded. The singleton settings row contains only already confirmed facts.

## Recommended next move

Obtain the first owner email, configure hosted Auth/SMTP/server secret, bootstrap that owner, and run authenticated owner/editor/viewer acceptance tests. In parallel, Phase 03 can begin the public catalog against the typed data adapter while 10–20 verified pilot products are collected.

## Non-negotiables

- No payments in MVP.
- No invented product, authenticity, medical, pricing, policy, or review claims.
- Design approval precedes implementation.
- 3D serves product storytelling and must degrade gracefully.
- Measure qualified inquiries and store intent, not only likes or page views.

See `AGENTS.md` for binding rules and `README.md` for the full knowledge map.
