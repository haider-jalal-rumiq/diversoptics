/**
 * Imports the supplied sunglasses photographs into the catalog and publishes them.
 *
 * These are real photographs of real stock, taken on the Diverso display podium,
 * so they replace the drawn placeholders rather than joining them. What is *not*
 * yet known is which frame each file shows: brand, model and colour are still to
 * be confirmed by the client in the CMS. Every product is therefore created with
 * no brand and a clearly provisional name, per AGENTS.md, which forbids asserting
 * a brand or model before inventory is confirmed. Guessing a brand from a logo
 * glimpse would be exactly that assertion.
 *
 * It mirrors the CMS media pipeline in
 * src/app/cms/(workspace)/products/[id]/media/actions.ts — same Sharp settings,
 * same path conventions, same columns — so an imported row is indistinguishable
 * from one an owner uploaded, and the CMS can edit, replace or archive it normally.
 *
 * Re-running is safe: products are matched on slug and their media replaced, so a
 * second run updates in place instead of creating duplicates.
 *
 * Usage, from apps/web:
 *   node --env-file=.env.local scripts/import-sunglasses.mjs [--dry-run] [--dir=<path>]
 */

import { createHash, randomUUID } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const DRY_RUN = process.argv.includes("--dry-run");
const dirArg = process.argv.find((arg) => arg.startsWith("--dir="));
const IMAGE_DIR = path.resolve(
  dirArg ? dirArg.split("=")[1] : "../../Diverso-Products-images",
);

const CATEGORY_SLUG = "sunglasses";

// The three brands the client has confirmed they stock. Created so the CMS brand
// picker is ready, published so assigning one later cannot trip the publication
// trigger, which refuses a product whose brand is still a draft. No logo_path:
// brand logo usage rights are still unconfirmed.
const BRANDS = [
  ["tom-ford", "Tom Ford"],
  ["swarovski", "Swarovski"],
  ["versace", "Versace"],
];

const MAX_SOURCE_PIXELS = 40_000_000;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

const supabase =
  SUPABASE_URL && SECRET_KEY
    ? createClient(SUPABASE_URL, SECRET_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;

if (!DRY_RUN && !supabase) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY. Run with --env-file=.env.local",
  );
  process.exit(1);
}

/** IMG_3999.webp -> "3999". Falls back to the whole stem for other filenames. */
function referenceOf(filename) {
  const stem = path.basename(filename, path.extname(filename));
  const digits = stem.match(/(\d+)\s*$/);
  return digits ? digits[1] : stem.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function describe(reference) {
  return {
    availability: "ask",
    category_id: null, // filled in by main once the category is resolved
    eyebrow: "Brand and model to be confirmed",
    model_number: `REF-${reference}`,
    name: `Sunglasses ${reference}`,
    price_mode: "on_inquiry",
    short_description:
      `Brand, model and colour for this frame are still being confirmed. ` +
      `Send reference ${reference} on WhatsApp and we will confirm the exact ` +
      `details and availability before you visit.`,
    sku: `SG-${reference}`,
    slug: `sunglasses-${reference}`,
    status: "draft",
  };
}

async function buildDerivative(sourceBuffer) {
  const metadata = await sharp(sourceBuffer, { failOn: "warning" }).metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("Image has no readable dimensions");
  }

  if (metadata.width * metadata.height > MAX_SOURCE_PIXELS) {
    throw new Error("Image is too large to process safely");
  }

  return sharp(sourceBuffer, { failOn: "warning" })
    .rotate()
    .resize({
      fit: "inside",
      height: 1_800,
      width: 1_800,
      withoutEnlargement: true,
    })
    .webp({ effort: 5, quality: 84 })
    .toBuffer({ resolveWithObject: true });
}

async function importOne(file, categoryId) {
  const reference = referenceOf(file);
  const row = { ...describe(reference), category_id: categoryId };
  const sourceBuffer = await readFile(path.join(IMAGE_DIR, file));
  const derivative = await buildDerivative(sourceBuffer);

  if (DRY_RUN) {
    return { ...row, size: derivative.data.byteLength };
  }

  // Upsert on slug so a second run edits the same product rather than failing on
  // the unique constraint. status is not upserted over: a product the client has
  // already published and renamed must not be dragged back to a draft placeholder.
  const existing = await supabase
    .from("products")
    .select("id")
    .eq("slug", row.slug)
    .maybeSingle();

  if (existing.error) {
    throw new Error(`Lookup failed: ${existing.error.message}`);
  }

  let productId = existing.data?.id;

  if (!productId) {
    const insert = await supabase
      .from("products")
      .insert(row)
      .select("id")
      .single();

    if (insert.error) {
      throw new Error(`Product insert failed: ${insert.error.message}`);
    }

    productId = insert.data.id;
  }

  const sourcePath = `${productId}/originals/${randomUUID()}.webp`;
  const hash = createHash("sha256").update(sourceBuffer).digest("hex");
  const publicPath = `${productId}/${hash.slice(0, 24)}.webp`;

  const sourceUpload = await supabase.storage
    .from("catalog-source")
    .upload(sourcePath, sourceBuffer, {
      contentType: "image/webp",
      upsert: true,
    });

  if (sourceUpload.error) {
    throw new Error(`Source upload failed: ${sourceUpload.error.message}`);
  }

  const publicUpload = await supabase.storage
    .from("catalog-public")
    .upload(publicPath, derivative.data, {
      cacheControl: "31536000",
      contentType: "image/webp",
      upsert: true,
    });

  if (publicUpload.error) {
    await supabase.storage.from("catalog-source").remove([sourcePath]);
    throw new Error(`Derivative upload failed: ${publicUpload.error.message}`);
  }

  // Clear every earlier row for this product so a re-run cannot leave two both
  // claiming primary. A plain insert follows, not an upsert: public_path carries
  // no unique constraint, so there is nothing for onConflict to match on.
  await supabase.from("product_media").delete().eq("product_id", productId);

  const media = await supabase
    .from("product_media")
    .insert({
      alt_text: `Sunglasses, reference ${reference}, photographed on the Diverso display podium`,
      byte_size: derivative.data.byteLength,
      height: derivative.info.height,
      is_primary: true,
      mime_type: "image/webp",
      product_id: productId,
      public_path: publicPath,
      rights_status: "approved",
      source_path: sourcePath,
      width: derivative.info.width,
    })
    .select("id")
    .single();

  if (media.error) {
    await Promise.all([
      supabase.storage.from("catalog-source").remove([sourcePath]),
      supabase.storage.from("catalog-public").remove([publicPath]),
    ]);
    throw new Error(`Media row failed: ${media.error.message}`);
  }

  return { ...row, id: productId, size: derivative.data.byteLength };
}

async function main() {
  const files = (await readdir(IMAGE_DIR))
    .filter((name) => /\.(webp|jpe?g|png|avif)$/i.test(name))
    .sort();

  if (files.length === 0) {
    console.error(`No images found in ${IMAGE_DIR}`);
    process.exit(1);
  }

  console.log(`${files.length} images in ${IMAGE_DIR}\n`);

  if (DRY_RUN) {
    for (const file of files) {
      const row = await importOne(file, 0);
      console.log(
        `${file} -> ${row.slug} | ${row.name} | ${row.sku} | ${Math.round(row.size / 1024)} kB`,
      );
    }

    console.log(`\ndry run: ${files.length} products prepared, nothing written`);
    return;
  }

  const brands = await supabase
    .from("brands")
    .upsert(
      BRANDS.map(([slug, name], index) => ({
        name,
        slug,
        sort_order: index,
        status: "published",
      })),
      { onConflict: "slug" },
    )
    .select("slug");

  if (brands.error) {
    throw new Error(`Brand upsert failed: ${brands.error.message}`);
  }

  console.log(`brands ready: ${brands.data.map((b) => b.slug).join(", ")}`);

  const category = await supabase
    .from("categories")
    .select("id, status")
    .eq("slug", CATEGORY_SLUG)
    .single();

  if (category.error) {
    throw new Error(`Category "${CATEGORY_SLUG}" not found`);
  }

  if (category.data.status !== "published") {
    throw new Error(
      `Category "${CATEGORY_SLUG}" is ${category.data.status}; publish it before importing`,
    );
  }

  const imported = [];
  const failures = [];

  for (const file of files) {
    try {
      const row = await importOne(file, category.data.id);
      imported.push(row);
      console.log(`ok   ${file} -> ${row.slug} (${Math.round(row.size / 1024)} kB)`);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause);
      failures.push(`${file}: ${message}`);
      console.error(`FAIL ${file}: ${message}`);
    }
  }

  console.log(`\nimported ${imported.length}/${files.length}`);

  if (failures.length > 0) {
    console.error(`\n${failures.length} failed:\n  ${failures.join("\n  ")}`);
  }

  // Publish only what actually received media, so a partial run leaves a
  // consistent catalog rather than a half-published one.
  const publish = await supabase
    .from("products")
    .update({ status: "published" })
    .in(
      "id",
      imported.map((row) => row.id),
    )
    .eq("status", "draft")
    .select("slug");

  if (publish.error) {
    console.error(`\nPublishing failed: ${publish.error.message}`);
    process.exitCode = 1;
    return;
  }

  console.log(`published ${publish.data.length} products`);
}

await main();
