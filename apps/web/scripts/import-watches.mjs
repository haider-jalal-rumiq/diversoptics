import { watches } from "./data/watches-2026-09-18.mjs";
import { runImport, skuToken, slugify } from "./lib/import-catalog.mjs";

// runImport() resolves a single brand per pass, so this batch runs one pass per
// brand rather than duplicating a near-identical config file six times.
const BRANDS = [
  {
    slug: "michael-kors",
    eyebrow: "Michael Kors · Watches",
    label: "Michael Kors watches",
  },
  { slug: "casio", eyebrow: "Casio · Watches", label: "Casio watches" },
  {
    slug: "casio-edifice",
    eyebrow: "Casio Edifice · Watches",
    label: "Casio Edifice watches",
  },
  { slug: "g-shock", eyebrow: "G-Shock · Watches", label: "G-Shock watches" },
  { slug: "armani", eyebrow: "Armani · Watches", label: "Armani watches" },
  { slug: "seiko", eyebrow: "Seiko · Watches", label: "Seiko watches" },
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
    eyebrow: brand.eyebrow,
    featured: false,
    model_number: product.sku,
    name: product.name,
    price: product.price,
    price_mode: product.price === null ? "on_inquiry" : "fixed",
    short_description: `${brand.label.replace(" watches", "")} watch listed under reference ${product.sku}.`,
    sku: product.sku,
    slug: `${slugify(product.name)}-${skuToken(product.sku)}`,
  });
}

for (const brand of BRANDS) {
  const manifest = watches.filter((product) => product.brand === brand.slug);
  if (!manifest.length) {
    throw new Error(`No products in the manifest for brand ${brand.slug}.`);
  }

  await runImport({
    brandSlug: brand.slug,
    buildProduct: buildProduct(brand),
    categorySlug: "watches",
    expected: {
      files: manifest.reduce(
        (total, product) => total + product.files.length,
        0,
      ),
      products: manifest.length,
    },
    label: brand.label,
    manifest,
    reportSlug: `watches-${brand.slug}-2026-09-18`,
    sourceDir: "Watches",
    sourceLabel:
      "Client-supplied watch renders (no caption panel; SKUs from the client stock list)",
  });
}
