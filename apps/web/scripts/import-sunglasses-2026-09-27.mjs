import { sunglasses } from "./data/sunglasses-2026-09-27.mjs";
import { runImport, skuToken, slugify } from "./lib/import-catalog.mjs";

// runImport() resolves a single brand per pass, so this batch runs one pass per
// brand. Named with its date so it does not collide with the older
// import-sunglasses.mjs folder-scan script.
const BRANDS = [
  { slug: "chopard", label: "Chopard", name: "Chopard" },
  {
    slug: "salvatore-ferragamo",
    label: "Salvatore Ferragamo",
    name: "Salvatore Ferragamo",
  },
  { slug: "versace", label: "Versace", name: "Versace" },
];

function buildProduct(brand) {
  return (product, { brandId, categoryId }) => ({
    archived_at: null,
    // No stock counts were supplied for this batch, so availability is
    // confirmed over WhatsApp rather than guessed from an absent quantity.
    availability: "ask",
    brand_id: brandId,
    category_id: categoryId,
    currency: "PKR",
    description: `${product.name}. Client-supplied catalog reference/SKU: ${product.sku}. Contact Diverso Optics to confirm current availability and product configuration.`,
    eyebrow: `${brand.name} · Sunglasses`,
    featured: false,
    model_number: product.sku,
    name: product.name,
    price: product.price,
    price_mode: product.price === null ? "on_inquiry" : "fixed",
    short_description: `${brand.name} sunglasses listed under reference ${product.sku}.`,
    sku: product.sku,
    slug: `${slugify(product.name)}-${skuToken(product.sku)}`,
  });
}

for (const brand of BRANDS) {
  const manifest = sunglasses.filter((product) => product.brand === brand.slug);
  if (!manifest.length) {
    throw new Error(`No products in the manifest for brand ${brand.slug}.`);
  }

  await runImport({
    brandSlug: brand.slug,
    buildProduct: buildProduct(brand),
    categorySlug: "sunglasses",
    expected: {
      files: manifest.reduce(
        (total, product) => total + product.files.length,
        0,
      ),
      products: manifest.length,
    },
    label: `${brand.label} sunglasses`,
    manifest,
    reportSlug: `sunglasses-${brand.slug}-2026-09-27`,
    sourceDir: "Sunglasses",
    sourceLabel:
      "Client-supplied branded sunglasses renders, matched to the manufacturer cut-outs whose filenames carry the model reference",
  });
}
