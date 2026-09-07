import { montblancCufflinks } from "./data/montblanc-cufflinks-2026-09-07.mjs";
import { runImport, skuToken, slugify } from "./lib/import-catalog.mjs";

function buildProduct(product, { brandId, categoryId }) {
  return {
    archived_at: null,
    // The client supplied no stock counts for this batch, so availability is
    // confirmed over WhatsApp rather than guessed from an absent quantity.
    availability: "ask",
    brand_id: brandId,
    category_id: categoryId,
    currency: "PKR",
    description: `${product.name}. Client-supplied catalog reference/SKU: ${product.sku}. Contact Diverso Optics to confirm current availability and product configuration.`,
    eyebrow: "Montblanc · Cufflinks",
    featured: false,
    model_number: product.sku,
    name: product.name,
    price: product.price,
    price_mode: product.price === null ? "on_inquiry" : "fixed",
    short_description: `Montblanc cufflinks listed under reference ${product.sku}.`,
    sku: product.sku,
    slug: `${slugify(product.name)}-${skuToken(product.sku)}`,
  };
}

await runImport({
  brandSlug: "montblanc",
  buildProduct,
  categorySlug: "cufflinks",
  expected: { files: 72, products: 72 },
  label: "Montblanc cufflinks",
  manifest: montblancCufflinks,
  reportSlug: "montblanc-cufflinks-2026-09-07",
  sourceDir: "Cufflings",
  sourceLabel: "Montblanc cufflinks PNG artwork (SKU and price captions)",
});
