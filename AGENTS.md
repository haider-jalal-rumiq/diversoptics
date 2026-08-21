# Diverso Optics — contributor instructions

These instructions apply to the entire workspace.

## Read order

Before making material decisions, read:

1. `PROJECT.md`
2. `docs/10-decisions-and-client-inputs.md`
3. The domain document relevant to the task
4. `TASKS.md`

`docs/brand-guidelines.md` becomes the visual source of truth only after its status is changed to `Approved`. Until then, use the two concepts only for comparison and exploration.

## Locked project facts

- Business: Diverso Optics, a physical retail shop in F-11 Markaz, Islamabad.
- Known categories: branded eyewear/sunglasses, lens products/services, watches, and pens/writing instruments.
- The website is a catalog and lead-generation experience. It does not take online payments in the initial release.
- The primary conversion is a qualified WhatsApp inquiry; secondary conversions are a call, directions request, and in-store visit.
- The owner needs a simple CMS for products, images, descriptions, categories, brands, variants, availability, and featured collections.
- Design is completed and approved in Figma before production implementation.
- Preferred implementation family: Next.js, TypeScript, and Supabase.

## Accuracy and claims

- Never invent the shop number, phone number, WhatsApp number, business hours, policies, prices, stock, brand authorization, customer reviews, warranties, or years in business.
- Treat every unconfirmed value as a clearly labelled placeholder.
- Do not publish “100% original,” “authorized dealer,” medical/vision claims, UV protection, lens performance, warranty, or return claims without client-supplied proof and approval.
- Use real product model names and logos only after inventory and usage rights are confirmed.
- Do not fabricate testimonials, scarcity, sale prices, ratings, or before/after results.

## Experience rules

- Keep the public catalog editorial and easy to scan; avoid a crowded marketplace aesthetic.
- Replace a conventional cart with `Ask on WhatsApp` and an optional multi-product `Shortlist`.
- The WhatsApp message must carry product name, SKU/model, selected variant, URL, and an optional short inquiry ID.
- Show store trust and service evidence near conversion points: confirmed location, genuine product proof, fitting/lens expertise, policies, and real reviews.
- Mobile is the primary design context. All main actions must be keyboard accessible and have visible focus states.
- Motion and 3D are progressive enhancement. They must never block navigation, product understanding, or the WhatsApp CTA.
- Respect `prefers-reduced-motion`; provide static poster fallbacks; lazy-load WebGL after the main content; do not place a heavy 3D canvas on every product card.
- Target Core Web Vitals at the 75th percentile: LCP <= 2.5 s, INP <= 200 ms, CLS <= 0.1.

## Content and brand rules

- Voice: curated, knowledgeable, human, locally grounded, and premium without being pretentious.
- Write in clear English by default. Roman Urdu or Urdu can be introduced only after the client confirms language preference and review capacity.
- Lead with the customer benefit, then specifications. Avoid generic luxury filler such as “unparalleled excellence” unless evidence makes it meaningful.
- Product photos must show the real item accurately. AI-generated scenes may support campaigns but must not change product shape, color, markings, or material.
- Use the same approved color, type, image, motion, and logo rules across Figma, website, social posts, packaging, and store collateral.

## Delivery gates

1. Discovery facts confirmed.
2. One brand direction approved.
3. Sitemap, wireframes, and core conversion flow approved.
4. High-fidelity responsive Figma and motion prototype approved.
5. Architecture and content model frozen for MVP.
6. Build, CMS seeding, accessibility/performance QA, and launch.
7. Monthly social production and measurement loop.

Do not skip a gate unless the project owner explicitly authorizes it and the decision is recorded in `docs/10-decisions-and-client-inputs.md`.

## Workspace hygiene

- Keep root files concise and put detailed plans in `docs/`.
- Update `TASKS.md` and `CODEX.md` after completing a phase or changing a major decision.
- Preserve supplied originals. Store future working assets in `assets/source/`, optimized web assets in `assets/web/`, and social exports in `assets/social/YYYY-MM/`.
- Prefer descriptive kebab-case filenames and include product SKU where applicable.
- Add source URLs and retrieval dates to research documents. Separate verified observations, inferences, and recommendations.
