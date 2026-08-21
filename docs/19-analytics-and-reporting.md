# Analytics and reporting definitions

Status: event recording and the CMS report are implemented. Channel-side figures (Instagram, Google Business Profile) still need account access.

Date: 2026-08-22

## Why these definitions exist

`PROJECT.md` measures success in qualified WhatsApp inquiries and store intent, not likes or page views. That only works if everyone agrees what one "inquiry" is. This document fixes the definitions so a number quoted in a monthly report means the same thing every month.

## What is actually recorded

One row in `public.inquiry_events` per WhatsApp handoff, written by `public.record_inquiry_event()` immediately before the redirect.

| Field | Meaning |
|---|---|
| `public_id` | Short reference also printed as `Ref:` in the WhatsApp message |
| `event_type` | `single_product` or `shortlist` |
| `catalog_snapshot` | Allowlisted product facts: slug, sku, variant_sku, brand, name, price_mode, availability |
| `campaign` | Allowlisted UTM keys plus `ref` |
| `entry_path` | Path only; any query string is discarded |
| `anonymous_session_hash` | SHA-256 of a random first-party token, hashed in the application |
| `created_at` | Server timestamp |

### What is deliberately not recorded

- No name, phone number, email or message text. The conversation happens in WhatsApp and stays there.
- No prescription or medical detail. The database rebuilds the payload from an allowlist, so a free-text field cannot reach it even if a caller sends one.
- No reversible visitor identifier. Only a digest is stored, and the reporting query never selects it.
- No page-view or scroll tracking. Nothing is recorded unless a visitor deliberately starts a conversation.

## Metric definitions

**Inquiry.** One recorded event. A visitor who taps twice within a session produces one event, not two: the idempotency key is derived from the session token plus the exact selection, so a replay returns the first reference.

**Single-product inquiry.** `event_type = 'single_product'`. Exactly one product, sent from a product page.

**Shortlist inquiry.** `event_type = 'shortlist'`. Between one and twelve products, sent from `/shortlist`.

**Products asked about.** Distinct products across all snapshots. A shortlist of four counts as one inquiry and four products. Use inquiries when measuring demand for conversations, and products when measuring demand for stock.

**Qualified inquiry.** *Not derivable from this data.* An inquiry becomes qualified only when a person judges the conversation genuine. This is a manual field the team records after replying, in whatever CRM or sheet is chosen. The website can only report that the conversation was started.

**Inquiry source.** `campaign.utm_source`, falling back to `campaign.ref`, falling back to `Direct`. `Direct` means no campaign parameters were present — it does not prove the visitor typed the URL, since parameters are lost when a link is copied by hand.

**Entry path.** The path the visitor was on when they tapped. For a shortlist inquiry this is always `/shortlist`, so product attribution for those comes from the snapshot, not the path.

**Conversion to visit or sale.** Manual. Match the `Ref:` line in the WhatsApp conversation to `public_id` in the CMS Inquiries screen.

## Where to read it

**CMS → Inquiries** (`/cms/inquiries`), visible to any signed-in staff member:

- inquiries in the last 7 and 30 days
- split between single-product and shortlist
- most asked-about products
- sources and the pages that started the inquiry
- the 20 most recent references with date, type, products and source

The screen summarises the most recent 500 events and says so when older events fall outside that window. Rolling windows use one server clock per request.

## Known limits

- **Rolling windows, not calendar months.** "Last 30 days" is a moving window. A calendar-month report needs a date-range query, which is not built.
- **500-event cap.** Fine at pilot volume; a real aggregate query or a materialised view is the upgrade path.
- **No dedupe across sessions.** A visitor who clears cookies or switches device produces separate events. This inflates inquiry counts relative to unique people, which is the honest trade for not tracking people across devices.
- **A closed conversation is invisible.** If someone opens WhatsApp and never sends the message, it still counts as an inquiry. Treat the figure as intent to ask.
- **No channel-side data.** Instagram, TikTok and Google Business Profile metrics live in those platforms and need the account access listed in `TASKS.md`.
- **UTM tagging is not yet configured.** Until social and campaign links carry UTM parameters, nearly everything will read as `Direct`. That work is the "Configure UTMs and a lead/source tracking sheet or CRM" task.

## Monthly report shape

Suggested minimum, all available from the Inquiries screen except the last two:

1. Inquiries this month, split single-product versus shortlist
2. Products asked about, and the top five
3. Sources, with `Direct` shown separately
4. Pages that started the inquiry
5. Qualified inquiries — manual
6. Inquiry-to-visit and inquiry-to-sale — manual

Keep the definitions stable for at least one measurement cycle, per the change discipline in `INSTRUCTIONS.md`.

## Security note

`public.record_inquiry_event()` is a `SECURITY DEFINER` function that `anon` may execute. Supabase's database linter flags this as two warnings, and both are expected: anonymous visitors must be able to record an inquiry without holding insert rights on the table. The mitigations live inside the function — an explicit key allowlist, digest-format validation, payload size caps and query-string stripping. **Do not "fix" the warnings by revoking `EXECUTE`**, which would silently stop all inquiry recording.
