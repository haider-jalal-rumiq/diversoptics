/**
 * Attaches placeholder imagery to the preview catalog and publishes it.
 *
 * This exists because the publication trigger requires approved primary media,
 * so the seeded products cannot reach the website without images, and the CMS
 * upload flow needs a signed-in browser session.
 *
 * It mirrors the CMS media pipeline — same Sharp settings, same path
 * conventions, same columns — so a seeded row is indistinguishable from one an
 * owner uploaded, and the CMS can archive or replace it normally.
 *
 * The artwork is drawn locally rather than sourced from stock photography. See
 * scripts/lib/placeholder-artwork.mjs for why. Every image is visibly marked as
 * a placeholder and must be replaced with real product photography before
 * launch: AGENTS.md requires a product photo to show the real item.
 *
 * Usage, from apps/web:
 *   node --env-file=.env.local scripts/seed-preview-media.mjs [--dry-run] [--preview-dir=<path>]
 */

import { createHash, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

import { PALETTE, renderPlaceholderSvg } from "./lib/placeholder-artwork.mjs";

const DRY_RUN = process.argv.includes("--dry-run");
const previewArg = process.argv.find((arg) => arg.startsWith("--preview-dir="));
const PREVIEW_DIR = previewArg ? previewArg.split("=")[1] : null;

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

/**
 * One entry per seeded product: slug, title, model, artwork variation, alt text.
 * The artwork varies so no two products share an image, and the alt text
 * describes the illustration honestly rather than claiming it is a photograph.
 */
const CATALOG = [
  [
    "aurelia-meridian-round",
    "Aurelia Meridian Round",
    "AUR-MR-01",
    { accent: PALETTE.gold, kind: "eyewear", shape: "round" },
    "Illustrated placeholder showing round eyeglass frames",
  ],
  [
    "aurelia-kingsley-square",
    "Aurelia Kingsley Square",
    "AUR-KS-02",
    { accent: "#8ba7c4", kind: "eyewear", shape: "square" },
    "Illustrated placeholder showing square eyeglass frames",
  ],
  [
    "lumen-feather-titanium",
    "Lumen Feather Titanium",
    "LUM-FT-03",
    { accent: "#9aa5ad", kind: "eyewear", shape: "oval" },
    "Illustrated placeholder showing slim oval rimless frames",
  ],
  [
    "lumen-studio-rectangular",
    "Lumen Studio Rectangular",
    "LUM-SR-04",
    { accent: "#a8792a", kind: "eyewear", shape: "rectangular" },
    "Illustrated placeholder showing rectangular metal frames",
  ],
  [
    "aurelia-cadence-cat-eye",
    "Aurelia Cadence Cat Eye",
    "AUR-CC-05",
    { accent: "#c98a9b", kind: "eyewear", shape: "cat-eye" },
    "Illustrated placeholder showing cat eye frames",
  ],
  [
    "lumen-cadet-tr90",
    "Lumen Cadet TR90",
    "LUM-CT-06",
    { accent: "#5f9ea0", kind: "eyewear", shape: "round" },
    "Illustrated placeholder showing small round flexible frames",
  ],

  [
    "vantor-coastline-aviator",
    "Vantor Coastline Aviator",
    "VAN-CA-01",
    { accent: PALETTE.gold, kind: "eyewear", shape: "aviator", tinted: true },
    "Illustrated placeholder showing aviator sunglasses",
  ],
  [
    "vantor-harbour-wayfarer",
    "Vantor Harbour Wayfarer",
    "VAN-HW-02",
    { accent: "#3f6b4f", kind: "eyewear", shape: "wayfarer", tinted: true },
    "Illustrated placeholder showing wayfarer sunglasses",
  ],
  [
    "vantor-ridge-sport",
    "Vantor Ridge Sport",
    "VAN-RS-03",
    { accent: "#4a6fa5", kind: "eyewear", shape: "sport", tinted: true },
    "Illustrated placeholder showing wrapped sport sunglasses",
  ],
  [
    "aurelia-solene-oversized",
    "Aurelia Solene Oversized",
    "AUR-SO-04",
    { accent: "#b07d5a", kind: "eyewear", shape: "square", tinted: true },
    "Illustrated placeholder showing oversized sunglasses",
  ],
  [
    "vantor-atlas-titanium",
    "Vantor Atlas Titanium",
    "VAN-AT-05",
    { accent: "#7a6a58", kind: "eyewear", shape: "rectangular", tinted: true },
    "Illustrated placeholder showing square titanium sunglasses",
  ],

  [
    "lumen-clarity-single-vision",
    "Lumen Clarity Single Vision",
    "LUM-CSV-01",
    { accent: PALETTE.gold, kind: "lens", tint: "#cfe3ef" },
    "Illustrated placeholder showing a clear spectacle lens",
  ],
  [
    "lumen-continuum-progressive",
    "Lumen Continuum Progressive",
    "LUM-CP-02",
    { accent: "#7d8f6a", kind: "lens", tint: "#dfe6d4" },
    "Illustrated placeholder showing a progressive spectacle lens",
  ],
  [
    "lumen-shade-photochromic",
    "Lumen Shade Photochromic",
    "LUM-SP-03",
    { accent: "#8a7a66", kind: "lens", tint: "#b9ada0" },
    "Illustrated placeholder showing a tinted photochromic lens",
  ],

  [
    "meridian-orbit-automatic-40",
    "Meridian Orbit Automatic 40",
    "MER-OA40",
    { accent: PALETTE.gold, dial: "#27405e", kind: "watch", strap: "bracelet" },
    "Illustrated placeholder showing an automatic watch on a bracelet",
  ],
  [
    "meridian-field-quartz-38",
    "Meridian Field Quartz 38",
    "MER-FQ38",
    { accent: "#c9b48a", dial: "#1d1d1b", kind: "watch", strap: "leather" },
    "Illustrated placeholder showing a field watch on a strap",
  ],
  [
    "calder-dress-slim-36",
    "Calder Dress Slim 36",
    "CAL-DS36",
    { accent: "#a8792a", dial: "#e8dcc0", kind: "watch", strap: "leather" },
    "Illustrated placeholder showing a slim dress watch on a leather strap",
  ],
  [
    "calder-diver-42",
    "Calder Diver 42",
    "CAL-DV42",
    { accent: "#4f9e78", dial: "#14261f", kind: "watch", strap: "bracelet" },
    "Illustrated placeholder showing a diver watch with a rotating bezel",
  ],

  [
    "quillon-ledger-fountain",
    "Quillon Ledger Fountain",
    "QUI-LF-01",
    { accent: PALETTE.gold, body: "#1d1d1b", kind: "pen", nib: "fountain" },
    "Illustrated placeholder showing a fountain pen",
  ],
  [
    "quillon-meridian-rollerball",
    "Quillon Meridian Rollerball",
    "QUI-MR-02",
    { accent: "#d8b45f", body: "#7a5c2e", kind: "pen", nib: "rollerball" },
    "Illustrated placeholder showing a rollerball pen",
  ],
  [
    "quillon-atlas-ballpoint",
    "Quillon Atlas Ballpoint",
    "QUI-AB-03",
    { accent: "#68635e", body: "#9aa5ad", kind: "pen", nib: "rollerball" },
    "Illustrated placeholder showing an aluminium ballpoint pen",
  ],
  [
    "quillon-heritage-set",
    "Quillon Heritage Set",
    "QUI-HS-04",
    {
      accent: PALETTE.gold,
      body: "#2f2a3d",
      kind: "pen",
      nib: "fountain",
      pair: true,
    },
    "Illustrated placeholder showing a boxed pair of pens",
  ],
];

const MAX_SOURCE_PIXELS = 40_000_000;

async function buildImage(title, subtitle, art) {
  const svg = renderPlaceholderSvg({ art, subtitle, title });

  // The PNG stands in for the original an owner would have uploaded, so the
  // source-to-derivative relationship matches the CMS exactly.
  const sourceBuffer = await sharp(Buffer.from(svg), { density: 144 })
    .png({ compressionLevel: 9 })
    .toBuffer();

  const metadata = await sharp(sourceBuffer).metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("Rendered image has no dimensions");
  }

  if (metadata.width * metadata.height > MAX_SOURCE_PIXELS) {
    throw new Error("Rendered image is too large to process safely");
  }

  const derivative = await sharp(sourceBuffer, { failOn: "warning" })
    .rotate()
    .resize({
      fit: "inside",
      height: 1_800,
      width: 1_800,
      withoutEnlargement: true,
    })
    .webp({ effort: 5, quality: 84 })
    .toBuffer({ resolveWithObject: true });

  return { derivative, sourceBuffer };
}

async function seedProduct(product, entry) {
  const [, title, subtitle, art, altText] = entry;
  const { derivative, sourceBuffer } = await buildImage(title, subtitle, art);

  const sourcePath = `${product.id}/originals/${randomUUID()}.png`;
  const hash = createHash("sha256").update(sourceBuffer).digest("hex");
  const publicPath = `${product.id}/${hash.slice(0, 24)}.webp`;

  if (PREVIEW_DIR) {
    await mkdir(PREVIEW_DIR, { recursive: true });
    await writeFile(
      path.join(PREVIEW_DIR, `${product.slug}.webp`),
      derivative.data,
    );
  }

  if (DRY_RUN) {
    return { size: derivative.data.byteLength };
  }

  const sourceUpload = await supabase.storage
    .from("catalog-source")
    .upload(sourcePath, sourceBuffer, {
      contentType: "image/png",
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

  // Clear any earlier attempt for this product so re-running cannot leave two
  // rows both claiming to be primary.
  await supabase
    .from("product_media")
    .delete()
    .eq("product_id", product.id)
    .neq("public_path", publicPath);

  // A plain insert, not an upsert: public_path carries no unique constraint, and
  // the delete above already guarantees this product has no other media row.
  const insert = await supabase
    .from("product_media")
    .insert({
      alt_text: altText,
      byte_size: derivative.data.byteLength,
      height: derivative.info.height,
      // Set directly rather than through the primary-media RPC, because this is
      // the product's only media row.
      is_primary: true,
      mime_type: "image/webp",
      product_id: product.id,
      public_path: publicPath,
      rights_status: "approved",
      source_path: sourcePath,
      width: derivative.info.width,
    })
    .select("id")
    .single();

  if (insert.error) {
    await Promise.all([
      supabase.storage.from("catalog-source").remove([sourcePath]),
      supabase.storage.from("catalog-public").remove([publicPath]),
    ]);
    throw new Error(`Media row insert failed: ${insert.error.message}`);
  }

  return { size: derivative.data.byteLength };
}

async function main() {
  if (!supabase) {
    for (const entry of CATALOG) {
      const result = await seedProduct({ id: 0, slug: entry[0] }, entry);
      console.log(`drew ${entry[0]} (${Math.round(result.size / 1024)} kB)`);
    }

    console.log(`\ndrew ${CATALOG.length} images, nothing uploaded`);
    return;
  }

  const { data: products, error } = await supabase
    .from("products")
    .select("id, slug, status")
    .in(
      "slug",
      CATALOG.map(([slug]) => slug),
    );

  if (error) throw new Error(`Could not load products: ${error.message}`);

  const bySlug = new Map((products ?? []).map((row) => [row.slug, row]));
  const failures = [];
  const seeded = [];

  for (const entry of CATALOG) {
    const product = bySlug.get(entry[0]);

    if (!product) {
      failures.push(`${entry[0]}: not found in the database`);
      continue;
    }

    try {
      const result = await seedProduct(product, entry);
      seeded.push(product);
      console.log(`ok   ${entry[0]} (${Math.round(result.size / 1024)} kB)`);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause);
      failures.push(`${entry[0]}: ${message}`);
      console.error(`FAIL ${entry[0]}: ${message}`);
    }
  }

  console.log(`\nattached ${seeded.length}/${CATALOG.length}`);

  if (failures.length > 0) {
    console.error(`\n${failures.length} failed:\n  ${failures.join("\n  ")}`);
  }

  if (DRY_RUN) {
    console.log("dry run: nothing published");
    return;
  }

  // Publish only products that actually received media, so a partial run leaves
  // a consistent catalog rather than a half-published one.
  const publishable = seeded
    .filter((row) => row.status === "draft")
    .map((row) => row.id);

  if (publishable.length === 0) {
    console.log("nothing left to publish");
    return;
  }

  const { data: published, error: publishError } = await supabase
    .from("products")
    .update({ status: "published" })
    .in("id", publishable)
    .select("slug");

  if (publishError) {
    console.error(`\nPublishing failed: ${publishError.message}`);
    process.exitCode = 1;
    return;
  }

  console.log(`published ${published?.length ?? 0} products`);
}

await main();
