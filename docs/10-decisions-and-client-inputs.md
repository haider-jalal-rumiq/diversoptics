# Decisions and client inputs

Status: open discovery log.  
Rule: unresolved facts remain placeholders and cannot be published.

## Confirmed and remaining inputs for Figma

| Priority | Decision / input | Current state | Owner | Resolution |
|---|---|---|---|---|
| P0 | Choose Golden Orbit or Optical Atelier | Confirmed: Golden Orbit | Client | Approved 2026-08-21 |
| P0 | Confirm exact legal/customer-facing name and descriptor | `Diverso Optics` assumed | Client | — |
| P0 | Confirm whether the current yellow logo must be retained and which signage/packaging already uses it | Current logo retained; signage/packaging usage still unknown | Client | Logo decision approved 2026-08-21 |
| P0 | Provide vector logo/source if one exists | Only two JPEGs supplied | Client | — |
| P0 | Confirm exact shop number/address and map pin in F-11 Markaz | Only locality known | Client | — |
| P0 | Confirm WhatsApp number, phone, email, hours, holidays | WhatsApp confirmed; phone/email/hours/holidays open | Client | Public WhatsApp `+92 333 5777710`; test-only `03438067821` |
| P0 | Confirm launch categories and terminology: optical frames, sunglasses, prescription lenses, contact lenses, watches, pens | Partially confirmed | Client | Sunglasses; Watches; Pens; Optical Frames — Men/Women/Kids; Contact Lenses — Transparent/Colored. Prescription lens services still open. |
| P0 | Provide 10–20 representative real products across categories | Not provided | Client | — |
| P0 | Confirm price display: all prices, selected prices, or price on inquiry | Confirmed for MVP | Client | Support multiple price modes; default to `Price on inquiry` until verified pricing is supplied. |
| P0 | Define availability meanings and how often stock is updated | Unknown | Client | — |

## Trust, policies, and services

| Question | Why it matters | Evidence required |
|---|---|---|
| Which brands are genuine stock, authorized, parallel import, or other? | Claims, brand pages, customer trust | Invoices, authorization, supplier records, client-approved language |
| What warranty applies by category/brand? | Product page and WhatsApp replies | Written policy/brand warranty |
| What is the exchange/return policy? | Conversion and legal clarity | Written policy |
| Is delivery offered? Where, cost, timing, COD? | Delivery is confirmed; exact customer expectation still needs definition | Coverage, cost, timing, COD and written operational policy remain open |
| Can customers reserve items to try? For how long? | CTA scope | Store process |
| Are eye tests, fitting, adjustments, repairs, engraving, gift wrap, or lens consultations offered? | Services and content | Staff/process confirmation |
| Who reviews lens/eye-care content and what qualifications do they hold? | Safety and credibility | Reviewer name/qualification/approval |
| How long has the shop operated and under what name? | About/heritage claims | Verifiable history |
| Are there real reviews/testimonials we may quote and link? | Trust modules/social | Source URL and permission where needed |

## Audience and commercial choices

- Primary geographic market: Islamabad only, twin cities, or Pakistan-wide?
- Primary buyer: students, professionals, families, collectors, gift buyers, or a mix?
- Typical and target price bands by category?
- Top ten revenue/priority brands?
- Does the client want premium-only positioning or a premium presentation across multiple price levels?
- Which categories have the best margin, stock depth, and staff expertise?
- Are seasonal drops, sales, or gift periods planned?
- What constitutes a qualified WhatsApp inquiry?
- Who responds, during what hours, and what response time is realistic?
- How will staff record whether an inquiry became a store visit or sale?

## Content and production

- Existing product photographs, manufacturer assets, videos, price sheets, and catalogs?
- Rights to use manufacturer brand logos and campaign images?
- Access to the store for exterior/interior/staff filming?
- Staff/talent willing to appear on camera and signed permission?
- Photography/video equipment and monthly production budget?
- Can the team create 3–4 anchor posts/week and answer daily, or should cadence be reduced?
- English only, English + Roman Urdu, or English + Urdu? Who approves translations?
- Topics, products, or competitors the client does not want referenced?

## Digital access and infrastructure

- Preferred domain and current ownership/DNS access.
- Existing hosting, email, Google Business Profile, WhatsApp Business, Meta Business Manager, Instagram, Facebook, TikTok, Google Analytics/Search Console.
- Current usernames/handles and account recovery ownership.
- Existing customer/product spreadsheet or POS export.
- Need for multiple CMS users and roles.
- Expected catalog size at launch and after one year.
- Analytics/privacy preference and consent requirements.
- Monthly infrastructure budget for Vercel, Supabase, media, analytics, monitoring, and domain/email.

## Decisions proposed by this plan

| Decision | Recommendation | Status |
|---|---|---|
| Commerce model | Catalog + WhatsApp; no payment in MVP | Confirmed |
| Cart model | Rename to Shortlist; no quantity/shipping/payment semantics | Confirmed |
| Tech stack | Next.js + TypeScript + Supabase + Vercel | Confirmed |
| CMS | Custom owner-friendly admin on Supabase, not direct Studio editing | Confirmed |
| 3D | Progressive-enhancement hero/pilot; no WebGL until a verified real asset exists | Confirmed for MVP |
| Languages | English first; add bilingual only with review capacity | Confirmed for MVP |
| Social priority | Instagram primary; TikTok discovery; Facebook/local; GBP essential | Awaiting confirmation |
| SEO model | Product snippets + LocalBusiness; no false merchant checkout | Confirmed for MVP |

## Client meeting agenda

1. Business goals and what a successful first 90 days means.
2. Assortment, price position, stock, and authenticity evidence.
3. Services, policies, delivery, and WhatsApp operations.
4. Audience and language.
5. Review and approve the Phase 0 Figma scope and Orbit Concierge concept.
6. Select 10–20 seed products and schedule a store/product shoot.
7. Confirm Figma review participants and turnaround time.
8. Confirm account/domain access and ownership.

## Decision log

Add dated entries; do not overwrite history.

| Date | Decision | Rationale | Approved by | Documents affected |
|---|---|---|---|---|
| 2026-08-20 | Planning baseline created; no brand direction selected | Discovery foundation | Project owner draft | All |
| 2026-08-21 | Golden Orbit selected and current logo retained | Preserve recognition while elevating the visual system | Client | `03-brand-directions.md`, `brand-guidelines.md`, Figma plan |
| 2026-08-21 | Public WhatsApp confirmed as `+92 333 5777710`; `03438067821` is test-only | Separate production inquiries from development testing | Client | Business context, UX, implementation configuration |
| 2026-08-21 | Delivery offered; policy details remain open | Delivery may appear as a confirmed service but no area/cost/time/COD promise may be designed as final | Client | Business context, product/store content |
| 2026-08-21 | Initial catalog shape confirmed | Plan CMS and discovery around realistic launch scale | Client | Architecture, UX, Figma, content production |
| 2026-08-21 | Gate 3 sitemap, conversion flows and mobile wireframes approved | Authorize responsive high-fidelity composition while preserving the code gate | Project owner | `14-figma-gate-3-sitemap-wireframes.md`, Figma |
| 2026-08-21 | Website/CMS implementation plan accepted | Lock the shortlist model, English MVP, Next.js/Supabase/Vercel family, price-mode contract and phase workflow | Project owner | Architecture, UX, Figma, delivery backlog |
| 2026-08-21 | Gate 4 high-fidelity handoff prepared | Public, CMS, motion and failure-state designs are ready for review; production implementation is still blocked pending approval | Project owner review pending | `15-figma-high-fidelity-handoff.md`, Figma, `TASKS.md` |
