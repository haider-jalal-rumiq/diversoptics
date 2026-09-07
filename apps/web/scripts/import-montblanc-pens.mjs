import { montblancPens } from "./data/montblanc-pens-2026-04-06.mjs";
import {
  retryNetwork,
  runImport,
  skuToken,
  slugify,
} from "./lib/import-catalog.mjs";

function buildProduct(product, { brandId, categoryId }) {
  const priceMode = product.price === null ? "on_inquiry" : "fixed";
  const availability =
    product.quantity === null
      ? "ask"
      : product.quantity > 0
        ? "in_store"
        : "out_of_stock";
  const kind = product.accessory
    ? "Montblanc pen accessory"
    : "Montblanc writing instrument";

  return {
    archived_at: null,
    availability,
    brand_id: brandId,
    category_id: categoryId,
    currency: "PKR",
    description: `${product.name}. Client-supplied catalog reference/SKU: ${product.sku}. Contact Diverso Optics to confirm current availability and product configuration.`,
    eyebrow: product.accessory
      ? "Montblanc · Pen accessory"
      : "Montblanc · Writing instrument",
    featured: false,
    model_number: product.sku,
    name: product.name,
    price: product.price,
    price_mode: priceMode,
    short_description: `${kind} listed under reference ${product.sku}.`,
    sku: product.sku,
    slug: `${slugify(product.name)}-${skuToken(product.sku)}`,
  };
}

/** Refreshes the Type/Material attributes the writing-instruments category defines. */
async function refreshAttributes({ categoryId, ids, productIds, supabase }) {
  const { data: definitions, error: definitionsError } = await retryNetwork(
    "load writing-instrument attributes",
    () =>
      supabase
        .from("attribute_definitions")
        .select("id, key")
        .eq("category_id", categoryId)
        .in("key", ["instrument_type", "body_material"]),
  );
  if (definitionsError)
    throw new Error(`Could not load attributes: ${definitionsError.message}`);
  const definitionIds = new Map(
    (definitions ?? []).map((definition) => [definition.key, definition.id]),
  );
  const attributeRows = montblancPens.flatMap((product) => {
    const productId = productIds.get(product.sku);
    return [
      product.type && definitionIds.has("instrument_type")
        ? {
            attribute_definition_id: definitionIds.get("instrument_type"),
            product_id: productId,
            value_text: product.type,
          }
        : null,
      product.material && definitionIds.has("body_material")
        ? {
            attribute_definition_id: definitionIds.get("body_material"),
            product_id: productId,
            value_text: product.material,
          }
        : null,
    ].filter(Boolean);
  });
  if (!attributeRows.length) return;

  const definitionIdList = [...definitionIds.values()];
  const { error: deleteError } = await retryNetwork(
    "clear imported pen attributes",
    () =>
      supabase
        .from("product_attribute_values")
        .delete()
        .in("product_id", ids)
        .in("attribute_definition_id", definitionIdList)
        .is("variant_id", null),
  );
  if (deleteError)
    throw new Error(`Could not refresh attributes: ${deleteError.message}`);
  const { error: attributeError } = await retryNetwork(
    "create imported pen attributes",
    () => supabase.from("product_attribute_values").insert(attributeRows),
  );
  if (attributeError)
    throw new Error(`Could not create attributes: ${attributeError.message}`);
}

/** Retires the three generic PEN-1..3 preview rows the real catalog replaced. */
async function archivePlaceholders({ supabase }) {
  const archivedAt = new Date().toISOString();
  const { error } = await retryNetwork("archive pen placeholders", () =>
    supabase
      .from("products")
      .update({ archived_at: archivedAt, status: "archived" })
      .in("sku", ["PEN-1", "PEN-2", "PEN-3"]),
  );
  if (error)
    throw new Error(`Could not archive pen placeholders: ${error.message}`);
}

await runImport({
  afterMedia: refreshAttributes,
  afterPublish: archivePlaceholders,
  brandSlug: "montblanc",
  buildProduct,
  categorySlug: "writing-instruments",
  expected: { files: 102, products: 89 },
  label: "Montblanc pens",
  manifest: montblancPens,
  reportSlug: "montblanc-pens-2026-04-06",
  sourceDir: "pens",
  sourceLabel: "M.B PENS FILE 06..04.2026.pdf and matching PNG artwork",
});
