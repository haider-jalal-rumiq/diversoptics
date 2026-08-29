/**
 * Imports the supplied demo watch and pen photographs into the catalog and
 * publishes them, replacing the earlier placeholder products in both
 * categories.
 *
 * Unlike import-sunglasses.mjs, these are not photographs of real Diverso
 * stock — the client has not supplied their own product photography yet, and
 * these exist only so the owner has something concrete to review before the
 * real set arrives. Every product is therefore created with no brand, a
 * clearly provisional name, and copy that says outright these are reference
 * images, per AGENTS.md, which forbids presenting an unconfirmed brand, model
 * or photo as real inventory.
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
 *   node --env-file=.env.local scripts/import-watches-pens.mjs [--dry-run] [--dir=<path>]
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

// Maps a filename prefix to the category it belongs in and how its rows are
// described. Kept as one table, rather than two near-duplicate scripts, since
// the only real difference between watches and pens here is vocabulary.
const GROUPS = [
  {
    categoryLabel: "Watch",
    categorySlug: "watches",
    prefix: "demo-watch",
    skuPrefix: "WAT",
    slugPrefix: "watch",
  },
  {
    categoryLabel: "Pen",
    categorySlug: "writing-instruments",
    prefix: "demo-pens",
    skuPrefix: "PEN",
    slugPrefix: "pen",
  },
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

/** demo-watch2.webp -> "2". Falls back to the whole stem for other filenames. */
function referenceOf(filename, prefix) {
  const stem = path.basename(filename, path.extname(filename));
  const digits = stem.slice(prefix.length).match(/(\d+)/);
  return digits ? digits[1] : stem.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function describe(group, reference) {
  const { categoryLabel, skuPrefix, slugPrefix } = group;
  return {
    availability: "ask",
    category_id: null, // filled in by main once the category is resolved
    eyebrow: "Reference photo, not confirmed stock",
    model_number: `REF-${skuPrefix}-${reference}`,
    name: `${categoryLabel} ${reference}`,
    price_mode: "on_inquiry",
    short_description:
      `This photo is a reference image while we wait on the client's own product photography, ` +
      `not a picture of confirmed in-store stock. Send reference ${reference} on WhatsApp and we ` +
      `will confirm the exact piece and availability before you visit.`,
    sku: `${skuPrefix}-${reference}`,
    slug: `${slugPrefix}-${reference}`,
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

async function importOne(group, file, categoryId) {
  const reference = referenceOf(file, group.prefix);
  const row = { ...describe(group, reference), category_id: categoryId };
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
      alt_text: `${group.categoryLabel}, reference ${reference} — reference photo, not the confirmed in-store item`,
      byte_size: derivative.data.byteLength,
      height: derivative.info.height,
      is_primary: true,
      mime_type: "image/webp",
      product_id: productId,
      public_path: publicPath,
      // Not photographed at Diverso, but the client supplied these files
      // themselves specifically for this on-site demo, so usage for that
      // purpose is cleared — unlike stock confirmation, which the copy
      // handles separately.
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

async function resolveCategory(slug) {
  const category = await supabase
    .from("categories")
    .select("id, status")
    .eq("slug", slug)
    .single();

  if (category.error) {
    throw new Error(`Category "${slug}" not found`);
  }

  if (category.data.status !== "published") {
    throw new Error(
      `Category "${slug}" is ${category.data.status}; publish it before importing`,
    );
  }

  return category.data.id;
}

async function main() {
  const allFiles = (await readdir(IMAGE_DIR)).filter((name) =>
    /\.(webp|jpe?g|png|avif)$/i.test(name),
  );

  const grouped = GROUPS.map((group) => ({
    group,
    files: allFiles
      .filter((name) => name.toLowerCase().startsWith(group.prefix))
      .sort(),
  }));

  const totalFiles = grouped.reduce((sum, g) => sum + g.files.length, 0);

  if (totalFiles === 0) {
    console.error(`No demo-watch*/demo-pens* images found in ${IMAGE_DIR}`);
    process.exit(1);
  }

  console.log(`${totalFiles} images in ${IMAGE_DIR}\n`);

  if (DRY_RUN) {
    for (const { group, files } of grouped) {
      for (const file of files) {
        const row = await importOne(group, file, 0);
        console.log(
          `${file} -> ${row.slug} | ${row.name} | ${row.sku} | ${Math.round(row.size / 1024)} kB`,
        );
      }
    }

    console.log(`\ndry run: ${totalFiles} products prepared, nothing written`);
    return;
  }

  const imported = [];
  const failures = [];

  for (const { group, files } of grouped) {
    if (files.length === 0) continue;

    const categoryId = await resolveCategory(group.categorySlug);

    for (const file of files) {
      try {
        const row = await importOne(group, file, categoryId);
        imported.push(row);
        console.log(
          `ok   ${file} -> ${row.slug} (${Math.round(row.size / 1024)} kB)`,
        );
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : String(cause);
        failures.push(`${file}: ${message}`);
        console.error(`FAIL ${file}: ${message}`);
      }
    }
  }

  console.log(`\nimported ${imported.length}/${totalFiles}`);

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
