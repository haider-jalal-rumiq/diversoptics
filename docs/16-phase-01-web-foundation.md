# Phase 01 — web foundation

Status: Implemented on `phase/01-web-foundation`; awaiting branch review and integration.

Date: 2026-08-21

## Confirmed inputs

- The Phase 00 design direction is Golden Orbit and the current Diverso logo remains the approved mark.
- The connected Supabase project is `diversoptics` (`eevpaueawctcutxultpi`) in `ap-northeast-1` and is healthy.
- Production WhatsApp uses `+92 333 5777710`; local and preview environments use `03438067821`.
- The MVP is a catalog and WhatsApp lead-generation experience. It does not accept payments.

No database objects or Storage policies were changed in this phase. Those changes remain owned by Phase 02 and will be introduced through versioned migrations.

## Foundation delivered

- pnpm workspace with the Next.js application at `apps/web`.
- Next.js 16 App Router, React 19, strict TypeScript, Tailwind CSS 4 and accessible Radix primitives.
- Golden Orbit design tokens, exact approved Figma icon/orbit exports, responsive layout primitives and a faithful home-page foundation.
- Server Components by default. The mobile navigation dialog and root error boundary are the only current client boundaries.
- Typed catalog contracts and a repository adapter ready to be replaced by Supabase queries in Phase 02.
- Fictional fixtures restricted to development and protected preview environments. A production build returns an empty catalog until verified Supabase content exists.
- Environment-safe WhatsApp routing that prevents test and production destinations from being mixed.
- Prelaunch `noindex`/`nofollow` metadata. Crawlability is enabled only during the Phase 05 launch gate.
- CI jobs for formatting, linting, strict type checking, unit tests, production builds, cross-browser Playwright checks and Lighthouse CI.

## Current routes

- `/` — approved Golden Orbit home foundation.
- `/preview/products/[slug]` — explicitly fictional protected-preview product detail used to test typed fixture flow.

Public catalog, inquiry, shortlist and CMS routes remain intentionally deferred to their planned phases.

## Verification record

- Prettier check: passed.
- ESLint with zero warnings: passed.
- Strict TypeScript: passed.
- Vitest: 3 files and 8 tests passed.
- Next.js production build: passed.
- Playwright: 16 tests passed across Chromium, Firefox, WebKit and mobile Chromium.
- axe: no serious or critical violations in the tested home experience.
- Reduced-motion and mobile navigation checks: passed.
- Lighthouse desktop local profile: Performance 100, Accessibility 100, Best Practices 100 and SEO 100 after excluding the intentional prelaunch crawlability audit.
- Lighthouse lab metrics: LCP 603 ms, CLS 0 and Total Blocking Time 20 ms.

Lighthouse values are local lab measurements, not production field data. They establish a Phase 01 baseline and do not replace post-deployment Core Web Vitals monitoring.

## Environment note

The application is pinned to Node.js 22 for development and CI. The current desktop shell exposes Node.js 24 for ordinary local commands, so pnpm prints an engine warning even though all checks pass. CI uses the supported Node.js 22 line.

## Phase 02 handoff

1. Add local Supabase configuration and versioned migrations.
2. Generate database TypeScript types.
3. Implement roles, invite-only authentication, RLS and Storage policies.
4. Replace the typed fixture repository with server-side Supabase adapters.
5. Build the CMS shell and catalog management flows before publishing real inventory.
