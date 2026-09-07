# Montblanc pens catalog import

Status: completed on 2026-09-07 against Supabase project `diversoptics` (`eevpaueawctcutxultpi`).

## Source reconciliation

- Client source: `Diverso-Products-images/pens/`.
- Intake: 102 PNG artworks and `M.B PENS FILE 06..04.2026.pdf`.
- The PDF has 100 populated product pages; the artwork resolves to 89 unique SKUs plus 13 additional views of repeated SKUs.
- Every supplied PNG is mapped once. Repeated SKUs are one product with a gallery, not duplicate products.
- Ten PDF-only SKUs were not published because no matching artwork was supplied: `126199`, `128363`, `130661`, `130663`, `131342`, `131363`, `132088`, `132089`, `132124`, and `132126`.
- SKU `198354` appears twice with conflicting prices and stock states. Both supplied views are retained, while the product safely uses `Price on inquiry` and `Ask about availability` until the client resolves the conflict.

The versioned manifest is `apps/web/scripts/data/montblanc-pens-2026-04-06.mjs`. Specific product names are used only where the client artwork or PDF identifies them; otherwise the title stays generic and includes the SKU.

## Media output

- Originals remain unchanged in the client intake folder and are preserved in the private `catalog-source` bucket.
- Web derivatives are WebP at quality 88, retain each source image's intrinsic dimensions, and are written to `assets/web/products/[sku]/`.
- Content-hashed derivatives are served from the public `catalog-public` bucket with one-year storage cache metadata.
- Total source size: 238.1 MB.
- Total WebP size: 11.0 MB.
- Reduction: 95.38%.
- Representative fountain-pen, multi-view, out-of-stock and accessory artwork passed side-by-side visual review.

## Published catalog state

- 89 published products.
- 102 approved public media records.
- 89 approved primary images.
- 76 fixed-price products using client-supplied PDF prices.
- 13 inquiry-price products where the PDF has no price or conflicting data.
- 68 `in_store`, 20 `out_of_stock`, and one `ask` availability state.
- Three generic `PEN-1`–`PEN-3` preview products archived and hidden from anonymous reads.
- Zero duplicate product SKUs or slugs.

Exact stock quantities are intentionally not displayed. They are translated into the public availability states above because the CMS schema and storefront are designed for availability confirmation over WhatsApp.

## Repeatable importer

Run from the repository root:

```powershell
pnpm --dir apps/web catalog:import:pens -- --apply
```

The command validates the 89/102 manifest, regenerates local WebPs, resumes existing product/media rows without duplicating them, assigns primary media, refreshes supported Type/Material attributes, publishes the reconciled set, and archives the old placeholders. Add `--refresh-media` only when the stored media objects and metadata must be re-uploaded.

`20260907051828_allow_service_role_primary_media.sql` aligns the primary-media RPC's internal guard with its existing `service_role` execution grant, allowing authenticated CMS editors and server-only batch imports while still rejecting anonymous callers.

## Verification completed

- Anonymous RLS view: 89 products, 102 media, zero placeholders.
- Representative public Storage URLs: HTTP 200 and `image/webp`.
- Supabase Storage metadata: `max-age=31536000` on checked derivatives.
- Vitest: 18 files and 114 tests passed.
- ESLint: passed with zero warnings.
- Strict TypeScript and Next route generation: passed.
- Next.js production build: passed.
- Headless Chromium: Pens listing, product detail, public product image and `/inquiry?product=...` WhatsApp transition link passed with zero console/page errors.

The post-migration advisor run reports only the project's pre-existing inquiry-function/password warnings and cold unused-index informational notices; this import introduced no new advisor finding.

