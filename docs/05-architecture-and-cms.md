# Architecture and CMS plan

Status: recommended MVP architecture. Implementation begins only after approved Figma and confirmed requirements.

## Decision

Use a single Next.js application with a public catalog and authenticated admin area, backed by Supabase Postgres/Auth/Storage. Deploy preview and production environments on Vercel.

This fits the developer’s existing Next.js/Supabase workflow, avoids introducing a separate headless CMS, and keeps product data, media authorization, inquiry events, and role security in one system. The tradeoff is that the admin experience must be designed and built; Supabase Studio alone is not suitable for a non-technical store owner.

## System shape

```text
Customer browser
  -> Next.js public catalog (Server Components + cached/ISR pages)
      -> Supabase Postgres (published catalog reads)
      -> Supabase Storage / optimized media
      -> Inquiry event endpoint -> immediate wa.me redirect

Owner browser
  -> /admin (authenticated Next.js UI)
      -> Supabase Auth
      -> Postgres mutations protected by RLS
      -> Storage uploads protected by policies

Deployment
  -> Vercel preview / production
  -> Supabase development / production projects
  -> analytics and error reporting, selected before build
```

## Stack

| Layer | Recommendation | Reason |
|---|---|---|
| Framework | Current supported Next.js App Router + TypeScript | Server rendering, route metadata, image tooling, preview deploys |
| UI | Tailwind CSS + small accessible primitives | Brand-specific design without a heavy component aesthetic |
| Database | Supabase Postgres | Relational catalog, filters, constraints, migrations |
| Auth | Supabase Auth | Owner/editor login and session handling |
| Authorization | Postgres Row Level Security | Policies protect tables and storage even if UI is bypassed |
| Media | Supabase Storage + Next Image | Central product assets, responsive delivery, policy control |
| Hosting | Vercel | Native Next.js deployment and previews |
| Motion | CSS/Motion for UI; optional React Three Fiber for approved 3D | Lightweight defaults and isolated WebGL |
| Validation | Zod or equivalent at server boundaries | Shared forms, imports, and mutation validation |
| Forms | Server Actions or route handlers with explicit authorization | Small server surface |
| Testing | Unit + component + Playwright E2E + Lighthouse/axe | Catalog, admin, and conversion confidence |

Use current supported versions at implementation time; do not freeze dependency versions in planning documents.

## Content model

### Core tables

#### `profiles`

- `user_id` UUID, references Auth user.
- `display_name`.
- `role`: `owner`, `editor`, `viewer`.
- `active`.

#### `categories`

- `id`, `name`, `slug`, `description`.
- `parent_id` for controlled nesting.
- `sort_order`, `published`.
- `attribute_schema` JSONB only if category-specific fields cannot be modeled cleanly.

#### `brands`

- `id`, `name`, `slug`.
- `summary`, `logo_path`, `website_url`.
- `authenticity_note` and `evidence_reference`, private/public separation as needed.
- `sort_order`, `published`.

#### `products`

- `id` UUID, `name`, `slug`, `sku`/model.
- `brand_id`, `category_id`.
- `short_description`, `description`.
- `price_amount` numeric nullable, `currency` default `PKR`, `price_mode`: `fixed`, `from`, `on_inquiry`, `hidden`.
- `availability`: `in_store`, `available_to_order`, `out_of_stock`, `ask`.
- `gender_fit`: controlled values as relevant.
- `featured`, `new_arrival`, `status`: `draft`, `published`, `archived`.
- `warranty_text`, `return_text`, `authenticity_text` from approved facts or null.
- `seo_title`, `seo_description` optional overrides.
- `published_at`, `created_at`, `updated_at`, `created_by`, `updated_by`.

#### `product_variants`

- `id`, `product_id`, `name`, `sku` nullable.
- `color_name`, `color_hex` nullable.
- `price_amount` nullable override.
- `availability` override.
- `attributes` JSONB for controlled category-specific values.
- `sort_order`, `active`.

#### `product_media`

- `id`, `product_id`, `variant_id` nullable.
- `storage_path`, `media_type`: `image`, `video`, `spin`, `model`.
- `alt_text`, `caption`, `width`, `height`, `bytes`.
- `is_primary`, `sort_order`.
- `source_status`: `client_original`, `manufacturer_approved`, `created`, `unknown`.

#### `attribute_definitions` and `product_attribute_values`

Use for filterable, typed data rather than putting every specification in a JSON blob.

- Definition: `key`, `label`, `data_type`, `unit`, `category_id`, `filterable`, allowed values.
- Value: `product_id` or `variant_id`, typed value columns or validated JSON value.

This supports eyewear shape/material/size, watch movement/case size, and pen type/refill without adding a new database column for every detail.

#### `collections` and `collection_products`

- Merchandising groups such as New Arrivals, Staff Picks, Eid Gifts, or Polarized Essentials.
- `title`, `slug`, `description`, `hero_media`, start/end dates, published state.
- Explicit product order.

#### `pages` / `guides`

- `title`, `slug`, `excerpt`, structured rich content, author/reviewer, status, published date, SEO fields.
- `reviewed_by` and `reviewed_at` for lens/vision content.

#### `site_settings`

- Business name, descriptor, WhatsApp number, phone, address, map URL, coordinates, hours, holiday notice, social URLs, default inquiry text, policy links.
- Limit to singleton rows or a typed key/value model with server validation.

#### `inquiry_events`

- Short `public_id`, timestamp, anonymous session ID, product/variant IDs or shortlist snapshot, entry page, campaign UTMs, event type.
- Never store the WhatsApp conversation or sensitive prescription text.
- Optional admin outcome fields later: `qualified`, `visited`, `sold`, `not_available`, `unknown`, plus order value if business processes allow.

#### `audit_log` — recommended

- Actor, action, table/entity ID, timestamp, and safe summary of changes.
- Do not log secrets or full sensitive payloads.

## Relationships and rules

- Slugs and SKUs are unique where business rules require.
- Deleting a brand/category with published products is blocked; archive instead.
- A product cannot publish without name, slug, SKU/model, category, primary image, valid price mode, and availability.
- Only one primary media item per product/variant.
- Filterable attributes must use approved definitions and values.
- Historical inquiry snapshots keep the displayed product name/SKU even if the product later changes.

## RLS and permissions

Supabase recommends Row Level Security for database and Storage access. [Supabase RLS documentation](https://supabase.com/docs/guides/database/postgres/row-level-security) and [Storage access control](https://supabase.com/docs/guides/storage/security/access-control).

Policy shape:

- Anonymous users can read published brands, categories, collections, guides, products, variants, and public media only.
- Anonymous users may insert a narrowly validated inquiry event through a server endpoint; direct table inserts can remain closed.
- Editors can create/update catalog and media but cannot change roles or destructive business settings.
- Owners can manage editors and settings.
- Service-role keys run server-side only and are never exposed to the browser.
- Storage upload/delete paths are scoped by authenticated role and bucket/folder.

Add application authorization checks as well as RLS. RLS is the final database boundary, not the only user experience control.

## CMS experience

### Product editor steps

1. Identity: category, brand, name, model/SKU, slug.
2. Selling information: short description, price mode/value, availability, badges.
3. Variants and specifications: generated from the category schema.
4. Media: drag/reorder, set primary, alt text, crop preview, source rights.
5. Policies/proof: verified statements only.
6. SEO/social preview.
7. Validation summary, preview, publish/schedule.

### Bulk workflow

- Provide a CSV template generated from current categories and required columns.
- Import into a review state; never publish directly from CSV.
- Show row-level errors and allow re-upload.
- Media is uploaded separately and matched by SKU-based filenames.
- Pilot with 10–20 varied products before loading the estimated 100+ eyewear items.

## Media strategy

- Preserve raw originals outside the web delivery bucket.
- Validate file type, dimensions, and size on upload.
- Generate or deliver responsive AVIF/WebP where supported; keep JPEG/PNG fallbacks as needed.
- Store intrinsic width/height to prevent layout shift.
- Public catalog media may use a public read bucket; admin/source material stays private.
- Supabase can perform on-the-fly image transformations on eligible plans, but architecture must not silently depend on a paid feature. [Supabase image transformations](https://supabase.com/docs/guides/storage/serving/image-transformations)
- Upload 3D models only after polygon, texture, compression, rights, and device testing review.

## Rendering and caching

- Server-render category, brand, product, guide, and store content.
- Cache published catalog reads and revalidate affected paths on CMS publish/update.
- Keep admin routes dynamic and non-indexable.
- Search/filter state is URL-addressable so links are shareable and browser back works.
- Use stable image dimensions and skeletons that match final layout.
- Lazy-load optional video/3D below or after the primary content.

## SEO and discoverability

- Unique title, description, canonical URL, Open Graph image, and index rules per public page.
- Generate sitemap and robots metadata using framework conventions. [Next.js metadata guidance](https://nextjs.org/docs/app/getting-started/metadata-and-og-images)
- Add validated `Organization`/`LocalBusiness`, `BreadcrumbList`, `Product`, and relevant `Article`/`VideoObject` JSON-LD.
- Since payment cannot complete on-site, follow product-snippet requirements rather than falsely presenting a merchant checkout.
- Use real product model/SKU in headings and metadata; avoid duplicated manufacturer descriptions.
- Keep store name/address/phone/hours consistent with Google Business Profile.
- Generate product/category social preview images from the approved design system when useful.

## Analytics contract

Track only events tied to decisions:

- `search_submitted` with query category, not personal text.
- `filter_applied` / `zero_results`.
- `product_viewed`.
- `shortlist_item_added` / `shortlist_opened`.
- `whatsapp_inquiry_started` with product/category, ref ID, and UTM.
- `call_clicked`, `directions_clicked`, `store_details_viewed`.
- `guide_viewed` and downstream inquiry.
- Web Vitals.

Do not claim a sale from a WhatsApp click. Close the loop with a simple lead outcome process. PostHog is a good optional plugin/product candidate later for product analytics; it is not required to start Figma.

## Performance budgets

Measured on representative mid-range mobile and production builds:

- P75 LCP <= 2.5 s, INP <= 200 ms, CLS <= 0.1.
- Reserve dimensions for all media and dynamic banners.
- Initial route JavaScript target <= 180 KB compressed where practical, excluding lazy optional 3D.
- Hero image target <= 300 KB at the delivered mobile size where visual quality permits.
- Optional glTF/model package target <= 2 MB delivered; textures compressed; load after poster and main CTA.
- Cap WebGL DPR, pause when offscreen, and render on demand where possible.
- Product grid images sized to their cards rather than delivering originals.

Budgets are reviewed against real assets; do not sacrifice product accuracy to hit an arbitrary byte count.

## Environments, migrations, and operations

- Separate development and production Supabase projects; use Vercel previews against development/test data.
- Version all SQL migrations and seed/reference data in the future code repository.
- Back up before schema/content migrations and test restore/rollback procedures.
- Use environment variables for public project URL/key and server-only secrets; never commit secrets.
- Seed demo products clearly labeled as demo and never expose them in production.
- Define an owner account recovery and staff offboarding process.
- Add error monitoring before launch and protect admin/inquiry endpoints with rate limits and input validation.

## Alternatives considered

### Separate headless CMS

Sanity/Contentful can accelerate rich editorial authoring, but add a second data/auth/media system. Reconsider if multiple non-technical editors, complex campaign pages, localization, or scheduled editorial workflows become dominant.

### Shopify

Strong for payment, inventory, and fulfillment, but the MVP deliberately avoids checkout and the developer already prefers Next.js/Supabase. Reconsider only when true ecommerce operations are approved.

### Supabase Studio as CMS

Useful for developer debugging, not the final owner experience. Direct table editing exposes implementation details and makes validation/media workflows too fragile.

