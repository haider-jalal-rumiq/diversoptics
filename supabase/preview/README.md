# Preview catalog seed

Fictional catalog content used to review the site design and exercise the CMS
before real inventory exists.

**Nothing here is run automatically.** These files are deliberately outside
`supabase/migrations/` and `supabase/seed.sql`, so neither `supabase db reset`
nor CI will ever apply them. The pgTAP suite asserts against an empty catalog and
would break if this data appeared in the test database.

## What it creates

| Table | Rows |
|---|---|
| `categories` | 6 published — eyewear with three children, watches, writing instruments |
| `brands` | 6 published, all invented names |
| `attribute_definitions` | 24 category-specific spec fields, none required |
| `products` | 22, created as drafts |
| `product_variants` | 24 |
| `product_attribute_values` | 86 |
| `collections` + assignments | 2 collections, 9 assignments |
| `pages` | 4 guide drafts, 1 policy draft |

Images are added separately by `apps/web/scripts/seed-preview-media.mjs`, which
also flips the products to published. Products cannot publish before that, because
the publication trigger requires approved primary media.

## Honesty constraints this seed respects

- **Brand and product names are invented.** AGENTS.md permits real brand or model
  names only after inventory and usage rights are confirmed, so no real brand
  appears anywhere.
- **Every image is drawn, not photographed**, and carries a visible
  "PLACEHOLDER IMAGE" caption. Stock photography was rejected: search results for
  eyewear and watches are dominated by identifiable people, and using someone's
  face to sell a product is a personality-rights problem no stock licence covers.
- **Guides and policies stay drafts.** Guide content needs professional review and
  policy wording needs client approval before either may be published.
- **No claim is made that could not be withdrawn.** No warranty, authenticity,
  dealer, medical or review claim appears in any seeded row.

## Traceability

Everything is identifiable so it can be removed cleanly:

- categories, brands and collections created here use a `dx-` slug prefix, except
  the three top-level categories and their children, whose slugs come from the
  approved sitemap and are intended to survive.
- products use a `DX-` SKU prefix.

## Applying

The catalog rows were applied directly against the project rather than from a
checked-in file, so the database is the record of what exists. Only the cleanup is
scripted, because that is the part with a deadline attached to it.

Imagery is re-runnable and idempotent — it replaces a product's existing media
row rather than adding a second primary:

```bash
cd apps/web && node --env-file=.env.local scripts/seed-preview-media.mjs
```

Add `--dry-run --preview-dir=<path>` to render the artwork to disk and inspect it
without touching the database.

## Removing before launch

`preview-catalog-cleanup.sql` deletes every seeded row, including its media rows.
It does **not** delete the uploaded Storage objects; list them under the product
id prefixes in the `catalog-source` and `catalog-public` buckets and remove them
from the Supabase dashboard, or replace the images through the CMS instead.

Run the cleanup before real inventory is entered, so a fictional product can never
sit alongside a real one.
