import { eyewear } from "./data/sunglasses-2026-10-03.mjs";
import { runImport, skuToken, slugify } from "./lib/import-catalog.mjs";

// runImport() resolves one brand and one category per pass, so the batch runs
// one pass per (brand, category) pair found in the manifest.
const KIND = {
  "optical-frames": "Optical Frames",
  sunglasses: "Sunglasses",
};

function buildProduct(brandName, category) {
  const kind = KIND[category];
  return (product, { brandId, categoryId }) => ({
    archived_at: null,
    // No stock counts were supplied for this batch, so availability is
    // confirmed over WhatsApp rather than guessed from an absent quantity.
    availability: "ask",
    brand_id: brandId,
    category_id: categoryId,
    currency: "PKR",
    description: `${product.name}. Client-supplied catalog reference/SKU: ${product.sku}. Contact Diverso Optics to confirm current availability and product configuration.`,
    eyebrow: `${brandName} · ${kind}`,
    featured: false,
    model_number: product.sku,
    name: product.name,
    price: product.price,
    price_mode: product.price === null ? "on_inquiry" : "fixed",
    short_description: `${brandName} ${kind.toLowerCase()} listed under reference ${product.sku}.`,
    sku: product.sku,
    slug: `${slugify(product.name)}-${skuToken(product.sku)}`,
  });
}

const passes = [
  ...new Map(
    eyewear.map((p) => [`${p.brand}|${p.category}`, [p.brand, p.category]]),
  ).values(),
];

for (const [brand, category] of passes) {
  const manifest = eyewear.filter(
    (p) => p.brand === brand && p.category === category,
  );
  const brandName = manifest[0].brandName;

  await runImport({
    brandSlug: brand,
    buildProduct: buildProduct(brandName, category),
    categorySlug: category,
    expected: {
      files: manifest.reduce((total, p) => total + p.files.length, 0),
      products: manifest.length,
    },
    label: `${brandName} ${KIND[category].toLowerCase()}`,
    manifest,
    reportSlug: `eyewear-${brand}-${category}-2026-10-03`,
    sourceDir: "Sunglasses",
    sourceLabel:
      "Client-supplied branded eyewear renders matched to the STOCK LIST 11 SEPTEMBER workbook",
  });
}
