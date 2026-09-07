# Montblanc cufflinks catalog import

Status: completed on 2026-09-07 against Supabase project `diversoptics` (`eevpaueawctcutxultpi`).

## Source reconciliation

- Client source: `Diverso-Products-images/Cufflings/`.
- Intake: 73 PNG files. 72 are cufflink artworks; the 73rd is excluded (see below).
- **No PDF was supplied for this batch.** The pens import had `M.B PENS FILE 06..04.2026.pdf`; the cufflinks folder contains no price list of any kind. Every SKU and price here is transcribed from the caption panel rendered into each PNG, which is the only source of record for this batch.
- The artwork resolves to 72 unique SKUs with exactly one view each — no repeated SKUs, so there are no multi-view galleries in this batch.
- Every supplied cufflink PNG is mapped once.
- `Codex Image Sep 7, 2026, 06_10_53 PM.png` is **not** a cufflink. It is a Montblanc *pen* card ("MONTBLANC PENS — Black Resin Silver-Tritm Rollerball Pen", SKU 2865, PKR 202,500) misfiled into the Cufflings folder. It is excluded from this import. SKU 2865 is not in the published pens catalog either, so the client should confirm whether it is a new pen to add.

The versioned manifest is `apps/web/scripts/data/montblanc-cufflinks-2026-09-07.mjs`.

### Names are descriptive, not official

Each caption panel prints only `MONTBLANC CUFFLINKS`, the SKU, and (usually) the price — unlike the pens artwork, it carries no product name. Every title is therefore written from the finish and face visible in the photograph and suffixed with the client's SKU, so the listing reads correctly and stays unambiguous to look up. Replace them with Montblanc's official collection names whenever the client supplies them.

### Prices

- 49 SKUs carry a price on their card and publish at that figure.
- 23 SKUs have **no price printed on the card at all** and publish as `Price on inquiry` rather than a guessed figure: `104506`, `109788`, `112896`, `112904`, `112998`, `112999`, `114766`, `116655`, `118599`, `118603`, `118607`, `118610`, `123812`, `124295`, `126472`, `128401`, `130265`, `132964`, `132977`, `132978`, `132979`, `134672`, `134674`.

### Stock

No stock counts were supplied for cufflinks in any form. Every product therefore uses `ask` availability, which the storefront renders as "Ask for status" and routes to WhatsApp confirmation. This is a deliberate choice over inventing quantities; supply counts and re-run the importer to switch products to `in_store` / `out_of_stock`.

## Media output

- Originals remain unchanged in the client intake folder and are preserved in the private `catalog-source` bucket.
- Web derivatives are WebP at quality 88, capped at 1800px on the long edge, written to `assets/web/products/[sku]/`.
- Content-hashed derivatives are served from the public `catalog-public` bucket with one-year storage cache metadata.
- Total source size: 156.1 MB.
- Total WebP size: 6.3 MB.
- Reduction: 95.97%.

## Published catalog state

- 72 published products, all in the new `cufflinks` category under the existing Montblanc brand.
- 72 approved public media records, one primary image per product.
- 49 fixed-price products, 23 inquiry-price products.
- 72 `ask` availability.
- Zero duplicate product SKUs or slugs.

## Storefront surfaces

- `20260907190000_add_cufflinks_category.sql` publishes the top-level `cufflinks` category. The storefront resolves categories through the `app/[...category]` catch-all route, so `/cufflinks` needed no new route file.
- `Cufflinks` was added to the header navigation (`catalog-navigation.ts`) and the site navigation list (`site.ts`), between Pens and Watches.
- `public/brand/categories/cufflinks.webp` is the homepage category-carousel still, cropped from SKU 116663's artwork to exclude the Diverso watermark and the caption panel.

## Repeatable importer

Run from the repository root:

```powershell
pnpm --dir apps/web catalog:import:cufflinks -- --apply
```

Add `--refresh-media` only when the stored media objects and metadata must be re-uploaded. Without `--apply` the command stops after writing local WebP derivatives, so the conversion can be reviewed before anything reaches Supabase.

### Shared importer engine

The pens importer's upload, retry, and primary-media logic was extracted to `apps/web/scripts/lib/import-catalog.mjs` so this second batch did not fork ~400 lines. `import-montblanc-pens.mjs` and `import-montblanc-cufflinks.mjs` are now thin configs supplying source folder, manifest, expected counts, category, product payload, and any per-batch follow-up work.

Two behaviour notes from this refactor:

- The pens importer was re-run in dry-run mode afterwards and reproduces its documented figures exactly (102 images, 238.1 MB → 11.0 MB, 95.38%), confirming the extraction is behaviour-preserving.
- `retryNetwork` now also retries an error whose message is empty. A Storage upload failed mid-import with a blank message, which the previous pattern match could not recognise as transient, aborting the whole run instead of retrying.

## Verification completed

- Anonymous RLS view: category published, 72 products, 72 media rows.
- Representative public Storage URLs: HTTP 200, `image/webp`, `max-age=31536000`.
- Other categories unchanged after the import: writing-instruments 89, sunglasses 49, optical-frames 6, watches 4, lenses 3.
- Vitest: 19 files and 115 tests passed.
- ESLint: passed with zero warnings.
- Strict TypeScript and Next route generation: passed.
- Headless browser: `/cufflinks` listing renders 72 products with prices and "Ask for status"; a product detail page renders breadcrumbs, price, WhatsApp inquiry and related items; homepage header, dropdown, carousel and footer all expose Cufflinks; zero console errors; all catalog and carousel images return 200.

## Open items for the client

1. Confirm prices for the 23 SKUs whose cards carry none.
2. Supply stock counts so availability can move off `ask`.
3. Supply official Montblanc product names to replace the descriptive titles.
4. Confirm whether misfiled pen SKU 2865 should be added to the pens catalog.
