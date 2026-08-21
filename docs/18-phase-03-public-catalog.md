# Phase 03 — public catalog handoff

Status: implementation complete. Both migrations are applied to the `diversoptics` project. Real pilot inventory, confirmed store facts and the first owner identity remain gates.

Date: 2026-08-22

## Outcome

Phase 03 builds the public catalog, search and filtering, product pages, the shortlist and the WhatsApp inquiry handoff on top of the Phase 02 schema. No product, price, policy, review or store fact was invented. Where a fact is not confirmed, the interface says so rather than filling the gap.

## Schema additions

Two gaps in the Phase 02 policy set blocked any anonymous public read. Both are closed by new migrations:

1. `20260821175000_expose_public_site_settings.sql` — `site_settings` was readable by staff only, so an anonymous visitor could not resolve the WhatsApp destination, address or hours. AGENTS.md forbids hard-coding those into components, so the singleton is now readable by `anon`. Every column on it is a public business fact.

2. `20260821175500_add_public_inquiry_event_recording.sql` — `inquiry_events` had no anonymous insert path, so the first-party inquiry event `docs/04` requires before the WhatsApp redirect could not be written. Rather than granting `anon` direct insert, `public.record_inquiry_event()` is a `security definer` function that:
   - rebuilds the stored snapshot and campaign payload from an explicit key allowlist, so free-text conversation, prescription details or contact data cannot be persisted through this path even if a caller sends them;
   - accepts only SHA-256 hex digests for the session and idempotency tokens, verified by format, so a raw token cannot be stored by mistake;
   - discards any query string from the entry path;
   - returns the existing reference when an idempotency hash repeats, so a double tap or a retried navigation does not create a second event;
   - caps a shortlist at 12 items and requires exactly one for a single-product inquiry.

Hashing happens in the application, so no reversible visitor identifier ever reaches the database.

`apps/web/src/types/database.types.ts` carried a hand-written entry for `record_inquiry_event` because regenerating requires Docker, which is unavailable on the current workstation. After the migrations were applied it was compared against a freshly generated set and matched exactly, so no regeneration was needed.

## Routes

| Route | Purpose |
|---|---|
| `/` | Golden Orbit home, now fed by the live catalog |
| `/[...category]` | Root-level category and subcategory listings, per the approved sitemap |
| `/new-and-featured` | Owner-flagged featured products |
| `/brands`, `/brands/[brand]` | Brand index and brand listing |
| `/collections/[collection]` | Curated editorial edit |
| `/products/[slug]` | Product detail, gallery, variants, specifications, inquiry |
| `/search` | Name, brand, SKU and model search |
| `/shortlist` | Browser-local comparison list and one-message inquiry |
| `/store` | F-11 store facts, with unconfirmed values labelled |
| `/guides`, `/guides/[slug]`, `/policies/[slug]` | CMS editorial pages |
| `/inquiry` | Records the inquiry event, then redirects to WhatsApp |
| `/api/shortlist` | Resolves browser-held slugs into published summaries |
| `/sitemap.xml`, `/robots.txt` | Generated from the live catalog |

Categories sit at the site root because the Gate 3 sitemap places them there. Static routes take precedence in the App Router, so `/brands` and `/store` are unaffected, and any path that is not a published category returns 404 rather than an empty listing.

## Architecture

- `features/catalog/domain/` holds pure logic and carries the unit tests: price and availability wording, category tree and path resolution, search-param parsing, shortlist rules, WhatsApp message builders, structured data, the Markdown subset and the catalog-source policy.
- `features/catalog/data/` holds the server adapters: a Supabase repository over the published catalog, a fixture repository with identical filtering, sorting, paging and facet semantics, public store settings and inquiry recording.
- Public reads use a cookie-free anonymous client. The cookie-bound client would opt every listing and product page out of caching, and anonymous catalog data is identical for every visitor.
- Filters, sort and paging are ordinary links built from the current state, so the catalog works without JavaScript, every combination has a shareable URL, and keyboard access comes for free. Filter permutations are `nofollow` and canonicalise to the clean path.
- The shortlist is browser storage read through `useSyncExternalStore`, so the server render stays empty and every page remains cacheable.
- Client components are limited to the shortlist controls, the gallery, the variant picker and the two dialogs.

## Deliberate decisions

- **Production never serves fixtures.** `resolveCatalogSource` ignores `CATALOG_SOURCE` in production and falls back to an empty catalog rather than to fixtures, so a misconfigured environment variable cannot publish invented products. An honest empty storefront is safer than a convincing fake one. A unit test locks this in.
- **Fixtures are labelled everywhere.** Every fixture record carries `demo`, and any page rendering fixture data shows a preview-data notice.
- **No claims without proof.** No authenticity, authorised-dealer, warranty, return, medical or review claim appears anywhere. Product pages point to a conversation instead. Brand pages show only CMS-entered copy.
- **Structured data matches visible facts.** A `Product` offer is emitted only when a real price exists, because a zero or absent price in structured data would advertise a number the business never approved. No ratings or reviews are emitted. `LocalBusiness` omits any field the CMS does not hold.
- **Markdown is rendered as React elements**, never through `dangerouslySetInnerHTML`, using a small documented subset. Editor content therefore cannot inject markup, and `javascript:` or `data:` link targets degrade to visible text. Adding a Markdown dependency was rejected because the lockfile could not be updated on this workstation.
- **Prices show as "Rs" for PKR**, which is what `en-PK` localises the currency to.
- **Store settings degrade instead of throwing.** Losing the shop address must not take down the storefront, and every consumer already renders an honest "not confirmed" state. Catalog product reads still fail loudly, because an empty catalog and a broken query must not look alike.

## Search indexing

Crawling remains closed. `isSearchIndexingEnabled()` requires both the production environment and `NEXT_PUBLIC_ENABLE_INDEXING=true`, so a preview deployment can never be indexed by omission. Until that flag is set at the Phase 05 gate, `robots.txt` disallows everything and every page is `noindex`. The sitemap is generated accurately regardless, so the launch gate is a single switch. `/search` and `/shortlist` stay `noindex` permanently.

## Verification

- Prettier, ESLint with zero warnings, and strict TypeScript pass.
- 103 Vitest tests across 16 files, including the business-hours builder and the inquiry metric aggregation added alongside this phase.
- 88 Playwright scenarios pass across Chromium, Firefox, WebKit and mobile Chromium, covering category scoping, filtering and reset on both desktop and the mobile drawer, search, product detail, structured data, shortlist round trip, the inquiry redirect contents, the unknown-product path, robots closure, focus restore, and axe checks on the listing and product pages.
- Lighthouse desktop, now covering the home, category and product pages: performance 100, accessibility 100, best practices 96, SEO 100, LCP 648–760 ms, CLS 0, TBT under 5 ms on all three.
- 20 new pgTAP assertions cover the inquiry function's privilege shape, idempotent replay, payload allowlist, entry-path stripping and every rejection case. These run in CI, which has Docker; `supabase start` is unavailable on this workstation.

Lighthouse figures are local lab measurements, not field data.

## Defects found and fixed during this phase

- `aria-pressed` was being set on facet anchors, which is invalid for the link role and was reported as a critical axe violation. Filter links now use `aria-current`.
- The mobile filter drawer stayed open after a filter link navigated, covering the results the visitor had just changed. It now remounts closed once navigation completes.
- The root skip link targeted `#main`, which several pages did not define. Every `main` landmark now carries the id.
- Listing pages jumped from `h1` straight to the `h3` facet groups. The filter and product regions now have headings, which restored a 100 accessibility score.

## Outstanding before launch

1. ~~Apply the two migrations~~ **Done.** Both were applied on 2026-08-22 and verified live: `anon` reads `site_settings`, may execute `record_inquiry_event`, and still has no insert or select right on `inquiry_events`. The function was smoke-tested inside a rolled-back transaction, confirming that a free-text `note` key, a non-UTM `secret` key and an entry-path query string are all discarded. `database.types.ts` was checked against a fresh generation and already matched, so no regeneration was needed.

   Supabase's database linter now reports two `SECURITY DEFINER` warnings for `record_inquiry_event`, both expected and documented in `docs/19-analytics-and-reporting.md`. Do not resolve them by revoking `EXECUTE`; that would silently stop all inquiry recording.
2. ~~Business hours cannot be edited in the CMS~~ **Done.** The settings screen now has a seven-day editor. A blank day stays unconfirmed and unpublished, which is deliberately different from marking the shop closed.
3. **Confirm the inquiry session cookie** in a privacy notice. `diverso_inquiry_session` is a random, `httpOnly`, first-party token used only to tell one visitor's inquiries apart so a double tap is not double-counted. It is hashed before storage and carries no personal data, but it should be disclosed.
4. **Real pilot inventory**, confirmed store facts, policy text and review evidence remain content gates owned by the client.
5. **Analytics reporting definitions** (`TASKS.md`) are not built. The inquiry event now records the data they will read.
