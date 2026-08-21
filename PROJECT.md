# Project brief

## Product name

Diverso Optics — catalog commerce, local retail discovery, and social-media system.

## Problem

The physical F-11 Markaz business needs a trustworthy digital storefront for a broad premium assortment without the operational burden of online payments. Customers should be able to discover by category or brand, understand a product, shortlist options, and continue with a knowledgeable person on WhatsApp or visit the store.

## MVP outcomes

- A fast, responsive public catalog for eyewear, lenses, watches, and writing instruments.
- Product discovery by category, brand, relevant attributes, availability, and search.
- Product-detail pages with accurate imagery, specifications, policies, service proof, and related items.
- One-item WhatsApp inquiry and a lightweight multi-product shortlist; no checkout or payment.
- Store page with verified address, hours, map, call, WhatsApp, parking/approach guidance if supplied, and real review evidence.
- Secure owner/admin CMS for products, brands, categories, variants, media, collections, and global content.
- Search-ready metadata and structured data suitable for non-purchasable product pages and a physical local business.
- Analytics for catalog discovery, WhatsApp intent, calls, directions, and shortlist behavior.
- Reusable brand and social design system plus a monthly content workflow.

## Initial non-goals

- Online payments, shipping-rate calculation, or financial checkout.
- Customer accounts, loyalty points, or complex order management.
- Live stock guarantees unless inventory operations can keep data accurate.
- Prescription diagnosis or medical advice.
- Full virtual try-on or photorealistic 3D for the entire catalog in MVP.
- A native mobile app.

## Positioning hypothesis

> Diverso Optics is the F-11 destination for distinctive eyewear, timepieces, and writing instruments—combining curated branded products with practical, personal guidance.

This is a hypothesis until the owner validates assortment, authenticity evidence, expertise, pricing position, and service promises.

## Audiences

1. Style-led professionals and students in Islamabad/Rawalpindi who want distinctive branded accessories.
2. Vision-first customers who need trustworthy frame/lens guidance and an in-store fit.
3. Gift buyers looking for watches or pens with a clear budget and quick human help.
4. Brand-led shoppers searching for a specific model and authenticity evidence.

## Success measures

### Business

- Qualified WhatsApp inquiries by category and campaign.
- Inquiry-to-store-visit and inquiry-to-sale rate, recorded manually or in a lightweight CRM.
- Calls and map/directions clicks.
- Product and category pages that generate inquiries.

### Experience

- Product-finding task success in usability tests.
- WhatsApp inquiry completion without retyping product details.
- Search/filter usage and zero-result rate.
- Core Web Vitals and accessibility acceptance criteria.

### Social

- Product saves and shares, profile visits, WhatsApp clicks, direction taps, and qualified DMs.
- Completion/hold rate on short-form video.
- Monthly content production completed on time with a consistent visual system.

## Recommended stack

- Next.js App Router + TypeScript
- Supabase Postgres, Auth, and Storage with Row Level Security
- Tailwind CSS plus a small accessible component layer
- Vercel hosting and preview deployments
- Figma for flows, design system, responsive screens, and motion prototypes
- Optional React Three Fiber only for approved, lazy-loaded 3D moments
- First-party inquiry event logging plus an approved analytics product

Full rationale and schema: `docs/05-architecture-and-cms.md`.

## Phase gates

| Phase | Exit condition |
|---|---|
| 0. Discovery | Business facts, inventory shape, policies, content resources, and brand evidence are confirmed |
| 1. Brand | One direction, logo treatment, palette, typography, voice, and image style are approved |
| 2. UX/Figma | Sitemap, wireframes, responsive high-fidelity screens, component states, and WhatsApp prototype are approved |
| 3. Build | Public catalog, CMS, inquiry tracking, SEO, and content model pass acceptance tests |
| 4. Launch | Real products are seeded; performance, accessibility, analytics, redirects, and operational training are complete |
| 5. Growth | Monthly social/content/SEO cycle runs with reporting and experiments |

