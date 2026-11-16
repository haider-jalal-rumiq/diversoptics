# Security hardening

This note records the controls in the website and CMS, the order in which to deploy them, the settings that live in the Supabase and Vercel dashboards, and what remains open. Where a control is enforced matters, so each row names the file or migration.

## Controls

| Area | Control | Where |
| --- | --- | --- |
| Secrets | `SUPABASE_SECRET_KEY` is read only by server-only modules. The only `NEXT_PUBLIC_` values are the site URL, the Supabase URL and the publishable key. `.env*` files are git-ignored. | `lib/supabase/admin.ts`, `.env.example` |
| Response headers | Content-Security-Policy, HSTS, `nosniff`, `X-Frame-Options: DENY`, referrer policy, a restrictive permissions policy and COOP on every response. SVG responses are sandboxed. CMS pages are `noindex`. | `lib/security/security-headers.ts`, `next.config.ts` |
| Session cookies | Supabase session cookies are `Secure` in production and `SameSite=Lax`. `HttpOnly` is unchanged because the media upload form reads the session through the browser client. | `lib/supabase/cookie-options.ts` |
| Staff authentication | Sessions are verified with `getClaims()` (signature checked) in the proxy and in every staff lookup. Only `active` profiles pass. | `proxy.ts`, `lib/supabase/proxy.ts`, `features/cms/auth/staff.ts` |
| Sign-in limits | 10 attempts per account and 40 per address in 15 minutes. Errors do not reveal whether an account exists. Failed sign-ins are logged by hashed email. | `app/cms/(auth)/login/actions.ts` |
| Passwords | Hashed by Supabase Auth; the application never stores one. Minimum 12 characters with lower case, upper case, a digit and a symbol. | `set-password/actions.ts`, `supabase/config.toml` |
| Links | Invitation and recovery links expire after 15 minutes (`otp_expiry = 900`). Only the listed OTP types are accepted, and the `next` parameter must stay under `/cms/`. | `supabase/config.toml`, `app/auth/confirm/route.ts` |
| Authorisation | Every exported CMS server action calls `requireCatalogEditor` or `requireOwner`. The CMS layout redirects when there is no staff member. Denials are logged. | `app/cms/**/actions.ts`, `features/cms/auth/staff.ts` |
| CSRF | Server Actions check `Origin` against `Host` (Next.js). The upload-token route requires a same-origin `Origin` and a JSON `Content-Type`. | `app/api/cms/products/[id]/media/upload-token/route.ts`, `lib/security/request-origin.ts` |
| Rate limits | Fixed windows counted in Postgres. Inquiries: 30 per address per 10 minutes. Upload tokens: 120 per staff member per 10 minutes. The limiter fails open and logs an outage, so a broken counter never blocks a sign-in. | `lib/security/rate-limit.ts`, migration `20261116120000` |
| Row-level security | Enabled on all 14 public tables. Anonymous reads cover the catalogue and the store settings. | `supabase/migrations/20260821134921_*.sql` |
| Inquiry recording | `record_inquiry_event` is executable only by the service role, so the publishable key cannot bypass the route's limit. | migration `20261116120100` |
| Counter table | `rate_limit_counters` has RLS enabled and no client grants. `consume_rate_limit` runs as definer with an empty `search_path`. | migration `20261116120000` |
| Storage | Source bucket: private, 15 MiB, JPEG/PNG/WebP/AVIF. Public bucket: 4 MiB, same types. Uploads are checked again by pixel count (40 MP) and by the expected path before processing. | initial schema migration, `features/cms/domain/media-upload.ts` |
| Input validation | Zod on sign-in, password set, upload intent and CSV rows (1 MB, 500 rows). Inquiry prices come from the database; the route accepts no price. | server actions, `app/inquiry/route.ts` |
| Search | Visitor text is reduced to letters, digits, spaces and a few punctuation marks before it enters the PostgREST `or` filter. | `features/catalog/data/supabase-catalog.ts`, `features/cms/data/products.ts` |
| Rich text | The Markdown renderer produces React elements only. Links to `javascript:`, `data:` and protocol-relative targets become plain text. | `features/catalog/domain/markdown.ts` |
| Structured data | JSON-LD escapes `<`, so a value cannot close the script element. | `components/seo/json-ld.tsx` |
| Security log | One JSON line per event with `source: "security"`. Identifiers are HMAC hashes keyed by the server secret. No email address, IP address, token or cookie is logged. | `lib/security/security-log.ts`, `lib/security/identifiers.ts` |

## Deployment order

Apply these in this order. The database changes depend on the code, so the code goes first.

1. Confirm `SUPABASE_SECRET_KEY` is set for Production in Vercel. Invitations need it already. After this change, inquiry recording and rate limiting need it too.
2. Deploy this branch.
3. Apply the migrations to the production database, in order:
   - `20261014090000_add_recent_activity_indexes.sql` (already pending from earlier work)
   - `20261116120000_add_rate_limit_counters.sql`
   - `20261116120100_restrict_inquiry_recording_to_server.sql`

If the restriction is applied before the new code is live, inquiries still open WhatsApp, but no event is recorded until the deployment catches up.

## Dashboard settings (owner action)

These cannot be set from the repository without pushing the whole Supabase configuration, which would overwrite other project settings.

- **Authentication → Email → OTP expiry:** 900 seconds.
- **Authentication → Sign-ups:** disabled. Staff join by invitation only.
- **Authentication → Passwords:** minimum 12 characters; require lower case, upper case, digits and symbols.
- **Authentication → URL configuration:** Site URL is the production HTTPS domain. Remove `localhost` from the redirect allow-list for production.
- **Optional:** leaked-password protection and multi-factor authentication for owners, if the plan includes them.
- **Vercel:** Firewall rules or bot protection for `/inquiry` and `/cms/login`, and a log drain that keeps the `security` events.

## Verification

- **Secret scan of the full git history.** Patterns covered: Supabase secret and publishable keys, JWTs, AWS keys, GitHub and Google tokens, Stripe keys, Resend and WhatsApp tokens, private-key blocks, and password literals. Environment-file names in history were checked too. The only match was the placeholder `SUPABASE_SECRET_KEY=sb_secret_replace_me` in `.env.example`. No real key appears in history, so nothing needs revoking on the strength of this scan.
- **Dependencies.** Next.js moved from 16.3.2 to 16.4.6, `sharp` to 0.35.5, `zod` to 4.6.7, `vitest` to 4.1.12, `vite` to 8.2.6, and `@lhci/cli` to 0.16.1. `eslint-config-next` now matches Next. `@testing-library/user-event` was removed because nothing imported it. Packages with known advisories that their parents have not yet fixed are pinned through `overrides` in `pnpm-workspace.yaml`. Three of those pins cross a major version, because the vulnerable line has no patch of its own: `basic-ftp` (5 to 6), `brace-expansion` (4 to 5) and `minimatch` (10 to 11). They sit in lint and Lighthouse tooling, not in the shipped site. The production audit and the full audit both report zero findings.
- **Migrations.** Both new migrations were run on PostgreSQL 17 (PGlite) with stub Supabase roles. Fifteen checks cover anonymous and authenticated denial, the counter limit, rejected input, definer rights, `search_path` and RLS. Docker is not available here, so the local Supabase stack was not run.
- **Build and tests.** Typecheck passes, lint passes with zero warnings, and 170 unit tests pass. `next build` succeeds and the public pages stay prerendered, so the policy does not remove static caching.
- **Served responses.** On the built server, the home, CMS login, store and product pages return the policy headers. SVG responses get the sandboxed policy, and CMS pages send `noindex`. The upload route refuses cross-site origins, mismatched origins and non-JSON bodies. A same-origin JSON request reaches the session check. The product page hydrates in the browser with no console errors, and `connect-src` refuses a cross-origin fetch.
- **Not exercised live.** Sign-in, database-backed rate limiting, invitation and recovery links, and the `Secure` cookie flag were covered by unit tests and the migration checks, not by a live Supabase project.

## Open items

- **Inline scripts are allowed.** Nonces would make every page render on each request, which would end the static caching the catalogue depends on. The rest of the policy limits where scripts can load from and where data can be sent. Moving to nonces or hashes would be a separate decision.
- **Overrides.** The pins in `pnpm-workspace.yaml` exist because upstream packages have not released their own fixes. Remove each pin when its parent package ships the patched version, then re-run `pnpm audit`.
- **Client address.** The limiter trusts the last `x-forwarded-for` entry, which Vercel appends. Self-hosting behind a different proxy needs this revisited.
- **Email link scanners.** Invitation and recovery links are verified on `GET`, so a mail scanner that follows the link can use it up. This is the current Supabase pattern and is accepted for now.
