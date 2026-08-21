# Phase 02 — Supabase and CMS handoff

Status: implementation complete; operational owner bootstrap and production email configuration remain.

Date: 2026-08-21

## Outcome

Phase 02 connects the approved Next.js foundation to the `diversoptics` Supabase project and adds an invite-only, role-aware catalog CMS. No real product, price, policy, customer, or review content was invented or seeded.

The cloud project reference is `eevpaueawctcutxultpi`. Public configuration is stored only in the git-ignored local environment; secret/service credentials are never checked in.

## Versioned database

Applied migrations:

1. `20260821134921_initial_catalog_cms_schema.sql`
2. `20260821135057_harden_rls_and_fk_indexes.sql`
3. `20260821135435_harden_invite_only_profiles.sql`
4. `20260821140716_add_primary_media_transaction.sql`
5. `20260821142518_add_atomic_product_attributes.sql`
6. `20260821144147_enforce_attribute_definition_integrity.sql`

The schema includes profiles, categories, brands, products, variants, media metadata, attribute definitions and values, collections and assignments, editorial pages, singleton business settings, privacy-minimized inquiry events, and audit events.

Security properties:

- Explicit Data API grants and RLS on all 14 exposed application tables.
- Anonymous reads are limited to published, non-archived public catalog rows.
- Viewer, editor, and owner permissions are enforced in both application actions and database policies.
- New Auth identities receive a disabled viewer profile until an owner activates them.
- Private source and public derivative Storage buckets have explicit MIME and size policies.
- Product publication requires a published category, a published brand when present, valid price state, an approved primary derivative, and every required attribute.
- Primary media changes and product attribute replacement are transactionally enforced by database functions.
- Optimistic `updated_at` checks prevent stale CMS forms from overwriting newer edits.

Generated TypeScript database types are checked in at `apps/web/src/types/database.types.ts` and should be regenerated after every schema migration.

## CMS capabilities

Routes under `/cms` provide:

- Verified-claim email/password sign-in and secure sign-out.
- Responsive Golden Orbit dashboard and recent privacy-minimized audit activity.
- Product search/status filtering, create/edit, draft/publish/archive, pricing modes, availability, featured state, and real-data preview.
- Variant SKU, pricing override, availability, order, and lifecycle management.
- Category, brand, and editorial collection management.
- Collection-to-product assignment.
- Category-specific text, number, boolean, option, and multi-option definitions.
- Atomic product attribute editing with required-field publication enforcement.
- Original image validation, private upload, dimension/pixel safeguards, Sharp WebP derivatives, content-hashed public paths, alt text, rights status, atomic primary selection, and recoverable archive behavior.
- Cross-product media review.
- Guide, policy, and general Markdown page management.
- All-or-nothing CSV-to-draft import for up to 500 rows/1 MB.
- Owner-only public business settings and staff role/status control.
- Optional owner invitation workflow when a server-only Supabase secret key is configured.

CMS and Auth routes are `noindex`. Server Components are the default; client code is limited to interactive forms. Every Server Action authenticates and authorizes independently because form visibility is not a security boundary.

## Auth email setup

Local Supabase uses `supabase/templates/invite.html`. Hosted Auth still needs these manual dashboard settings before invitations are used:

1. Set the production Site URL and approved preview/production redirect URLs.
2. Copy the tracked invite template into the hosted **Invite user** email template.
3. Keep the SSR link form: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite&next=/cms/set-password`.
4. Add `SUPABASE_SECRET_KEY` only to trusted local/Vercel server environments.
5. Configure production SMTP before client handoff.

This follows Supabase's current server-side token-hash flow and server-only admin-key guidance. Sources retrieved 2026-08-21: [Email templates](https://supabase.com/docs/guides/auth/auth-email-templates), [User management](https://supabase.com/docs/guides/auth/users), and [inviteUserByEmail](https://supabase.com/docs/reference/javascript/auth-admin-inviteuserbyemail).

## Verification

- 30 pgTAP assertions passed against the connected Postgres 17 project inside a rollback transaction.
- Supabase security advisor: zero findings.
- Supabase performance advisor: no warning/error findings; 18 expected `unused_index` informational notices while catalog tables are empty.
- Cloud catalog residue check: zero profiles, categories, brands, products, and media; the intended singleton settings row remains.
- Formatting, ESLint with zero warnings, strict TypeScript, 20 Vitest tests, and the Next.js production build pass.
- All 24 Playwright scenarios pass across Chromium, Firefox, WebKit, and mobile Chromium, including anonymous CMS protection, login accessibility, public fixture disclosure, mobile navigation, and reduced motion.
- Lighthouse desktop: Performance 99, Accessibility 100, Best Practices 100, SEO 100, LCP 0.8 s, CLS 0, and TBT 0 ms.
- Docker is not installed on this workstation, so local `supabase start` was unavailable. CI now starts the local stack and runs `supabase test db` on GitHub's Docker-enabled runner.

## Required operational input

There is intentionally no first owner account because no staff email was supplied. Before authenticated browser acceptance testing:

1. The client/project owner supplies the initial owner email and display name.
2. Create that identity in Supabase Auth using a one-time secure process.
3. Bootstrap only that profile to `role = 'owner'` and `status = 'active'`.
4. Configure the server secret, Auth URLs, hosted invite template, and SMTP.
5. Run the owner/editor/viewer browser acceptance scenarios before production deployment.

Real pilot inventory remains a separate content gate. Phase 03 can begin on fixtures while the owner/bootstrap and 10–20 verified pilot products are collected.
