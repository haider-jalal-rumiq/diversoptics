/**
 * Shared catalog importer. This is the pens importer's engine, lifted verbatim
 * so a second client batch (cufflinks) does not fork 400 lines of upload,
 * retry and primary-media logic. Everything that differs between batches —
 * source folder, manifest, expected counts, category, the product payload and
 * any per-batch follow-up work — arrives through the config object.
 */
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const EXPECTED_PROJECT_REF = "eevpaueawctcutxultpi";
const root = fileURLToPath(new URL("../../../../", import.meta.url));
const webRoot = join(root, "apps", "web");
const outputRoot = join(root, "assets", "web", "products");
const envPath = join(webRoot, ".env.local");

export function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function skuToken(sku) {
  return sku.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function deterministicUuidV4(hex) {
  const bytes = Buffer.from(hex.slice(0, 32), "hex");
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const value = bytes.toString("hex");
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`;
}

async function mapWithLimit(values, limit, worker) {
  const results = new Array(values.length);
  let cursor = 0;

  async function run() {
    while (cursor < values.length) {
      const index = cursor++;
      results[index] = await worker(values[index], index);
    }
  }

  await Promise.all(Array.from({ length: limit }, run));
  return results;
}

const transientErrorPattern =
  /fetch failed|network|timeout|timed out|gateway|econn|socket|5\d\d/i;

/**
 * Storage occasionally rejects an upload with an empty message, which the
 * pattern above cannot match — so a dropped connection used to abort the whole
 * import instead of retrying. An unreadable message is treated as transient:
 * the retry budget is finite, and a genuinely bad request still fails after it.
 */
function isTransient(message) {
  const text = typeof message === "string" ? message.trim() : "";
  return text === "" || transientErrorPattern.test(text);
}

export async function retryNetwork(label, operation, attempts = 5) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const result = await operation();
      if (!result?.error || !isTransient(result.error.message)) return result;
      lastError = result.error;
    } catch (error) {
      if (!transientErrorPattern.test(String(error))) throw error;
      lastError = error;
    }

    if (attempt < attempts) {
      await new Promise((resolve) =>
        setTimeout(resolve, 750 * 2 ** (attempt - 1)),
      );
      console.log(`Retrying ${label} (${attempt + 1}/${attempts}).`);
    }
  }

  throw new Error(
    `${label} failed after ${attempts} attempts: ${String(lastError)}`,
  );
}

async function uploadOrThrow(bucket, path, data, options) {
  const result = await retryNetwork(`upload ${path}`, () =>
    bucket.upload(path, data, { ...options, upsert: true }),
  );
  if (result.error)
    throw new Error(`Could not upload ${path}: ${result.error.message}`);
}

function validateManifest(config, sourceRoot) {
  const skus = new Set();
  const files = new Set();

  for (const product of config.manifest) {
    if (skus.has(product.sku)) throw new Error(`Duplicate SKU ${product.sku}.`);
    skus.add(product.sku);

    if (!product.files.length)
      throw new Error(`SKU ${product.sku} has no media.`);
    for (const file of product.files) {
      if (files.has(file)) throw new Error(`Duplicate source image ${file}.`);
      if (!existsSync(join(sourceRoot, file))) {
        throw new Error(`Missing source image ${file}.`);
      }
      files.add(file);
    }
  }

  if (
    config.manifest.length !== config.expected.products ||
    files.size !== config.expected.files
  ) {
    throw new Error(
      `The reconciled catalog must contain ${config.expected.products} products and ${config.expected.files} images.`,
    );
  }
}

async function prepareAssets(config, sourceRoot) {
  const jobs = config.manifest.flatMap((product) =>
    product.files.map((file, index) => ({ file, index, product })),
  );
  let sourceBytes = 0;
  let outputBytes = 0;

  const prepared = await mapWithLimit(
    jobs,
    4,
    async ({ file, index, product }, jobIndex) => {
      const sourcePath = join(sourceRoot, file);
      const sourceBuffer = await readFile(sourcePath);
      const sourceMetadata = await sharp(sourceBuffer, {
        failOn: "warning",
      }).metadata();
      if (!sourceMetadata.width || !sourceMetadata.height) {
        throw new Error(`${file} has invalid dimensions.`);
      }

      const hash = createHash("sha256").update(sourceBuffer).digest("hex");
      const derivative = await sharp(sourceBuffer, { failOn: "warning" })
        .rotate()
        .resize({
          fit: "inside",
          height: 1800,
          width: 1800,
          withoutEnlargement: true,
        })
        .webp({ effort: 6, quality: 88, smartSubsample: true })
        .toBuffer({ resolveWithObject: true });
      const token = skuToken(product.sku);
      const outputPath = join(
        outputRoot,
        token,
        `${token}-${String(index + 1).padStart(2, "0")}${index === 0 ? "-primary" : ""}.webp`,
      );

      await mkdir(dirname(outputPath), { recursive: true });
      await writeFile(outputPath, derivative.data);
      sourceBytes += sourceBuffer.byteLength;
      outputBytes += derivative.data.byteLength;

      if ((jobIndex + 1) % 20 === 0 || jobIndex + 1 === jobs.length) {
        console.log(`Prepared ${jobIndex + 1}/${jobs.length} images.`);
      }

      return {
        derivative: derivative.data,
        file,
        hash,
        height: derivative.info.height,
        index,
        outputPath,
        product,
        sourceBuffer,
        sourceHeight: sourceMetadata.height,
        sourceWidth: sourceMetadata.width,
        width: derivative.info.width,
      };
    },
  );

  const report = {
    generatedAt: new Date().toISOString(),
    imageCount: prepared.length,
    outputBytes,
    productCount: config.manifest.length,
    reductionPercent: Number(
      (100 - (outputBytes / sourceBytes) * 100).toFixed(2),
    ),
    source: config.sourceLabel,
    sourceBytes,
  };
  await mkdir(outputRoot, { recursive: true });
  await writeFile(
    join(outputRoot, `${config.reportSlug}-import-report.json`),
    `${JSON.stringify(report, null, 2)}\n`,
  );
  console.log(
    `Converted ${report.imageCount} images: ${(sourceBytes / 1024 / 1024).toFixed(1)} MB → ${(outputBytes / 1024 / 1024).toFixed(1)} MB (${report.reductionPercent}% smaller).`,
  );
  return prepared;
}

async function applyCatalog(config, prepared, refreshMedia) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !secretKey) {
    throw new Error("Supabase URL and server-only secret key are required.");
  }
  if (!new URL(supabaseUrl).hostname.startsWith(`${EXPECTED_PROJECT_REF}.`)) {
    throw new Error(
      `Refusing to import into a project other than ${EXPECTED_PROJECT_REF}.`,
    );
  }

  const supabase = createClient(supabaseUrl, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const [
    { data: category, error: categoryError },
    { data: brand, error: brandError },
  ] = await Promise.all([
    retryNetwork(`load ${config.categorySlug} category`, () =>
      supabase
        .from("categories")
        .select("id, status")
        .eq("slug", config.categorySlug)
        .single(),
    ),
    retryNetwork(`load ${config.brandSlug} brand`, () =>
      supabase
        .from("brands")
        .select("id, status")
        .eq("slug", config.brandSlug)
        .single(),
    ),
  ]);
  if (categoryError || brandError || !category || !brand) {
    throw new Error(
      `The ${config.categorySlug} category or ${config.brandSlug} brand is missing.`,
    );
  }
  if (category.status !== "published" || brand.status !== "published") {
    throw new Error(
      `The ${config.categorySlug} category and ${config.brandSlug} brand must be published.`,
    );
  }

  const skuList = config.manifest.map((product) => product.sku);
  const { data: existingProducts, error: existingError } = await retryNetwork(
    "load existing products",
    () => supabase.from("products").select("id, sku").in("sku", skuList),
  );
  if (existingError)
    throw new Error(
      `Could not load existing products: ${existingError.message}`,
    );
  const productIds = new Map(
    (existingProducts ?? []).map((product) => [product.sku, product.id]),
  );

  for (const product of config.manifest) {
    const payload = config.buildProduct(product, {
      brandId: brand.id,
      categoryId: category.id,
    });
    const existingId = productIds.get(product.sku);
    if (existingId) {
      const { error } = await retryNetwork(
        `update product ${product.sku}`,
        () => supabase.from("products").update(payload).eq("id", existingId),
      );
      if (error)
        throw new Error(`Could not update ${product.sku}: ${error.message}`);
      continue;
    }

    const { data, error } = await retryNetwork(
      `create product ${product.sku}`,
      () =>
        supabase
          .from("products")
          .insert({ ...payload, status: "draft" })
          .select("id")
          .single(),
    );
    if (error)
      throw new Error(`Could not create ${product.sku}: ${error.message}`);
    productIds.set(product.sku, data.id);
  }

  const ids = [...productIds.values()];
  const { data: existingMedia, error: mediaReadError } = await retryNetwork(
    "load existing media",
    () =>
      supabase
        .from("product_media")
        .select("id, product_id, source_path")
        .in("product_id", ids),
  );
  if (mediaReadError)
    throw new Error(`Could not load existing media: ${mediaReadError.message}`);
  const mediaBySourcePath = new Map(
    (existingMedia ?? []).map((media) => [media.source_path, media]),
  );
  const groupedPrepared = new Map();

  await mapWithLimit(prepared, 4, async (item, transferIndex) => {
    const productId = productIds.get(item.product.sku);
    const sourceUuid = deterministicUuidV4(item.hash);
    const sourcePath = `${productId}/originals/${sourceUuid}.png`;
    const publicPath = `${productId}/${item.hash.slice(0, 24)}.webp`;
    const existing = mediaBySourcePath.get(sourcePath);
    if (!existing || refreshMedia) {
      await Promise.all([
        uploadOrThrow(
          supabase.storage.from("catalog-source"),
          sourcePath,
          item.sourceBuffer,
          {
            cacheControl: "31536000",
            contentType: "image/png",
          },
        ),
        uploadOrThrow(
          supabase.storage.from("catalog-public"),
          publicPath,
          item.derivative,
          {
            cacheControl: "31536000",
            contentType: "image/webp",
          },
        ),
      ]);
    }

    const mediaPayload = {
      alt_text: `${item.product.name}, view ${item.index + 1}`,
      archived_at: null,
      byte_size: item.derivative.byteLength,
      height: item.height,
      is_primary: false,
      mime_type: "image/webp",
      product_id: productId,
      public_path: publicPath,
      rights_status: "approved",
      sort_order: item.index,
      source_path: sourcePath,
      width: item.width,
    };
    let mediaId;
    if (existing && refreshMedia) {
      const { error } = await retryNetwork(
        `update media for ${item.product.sku}`,
        () =>
          supabase
            .from("product_media")
            .update(mediaPayload)
            .eq("id", existing.id),
      );
      if (error)
        throw new Error(
          `Could not update media for ${item.product.sku}: ${error.message}`,
        );
      mediaId = existing.id;
    } else if (existing) {
      mediaId = existing.id;
    } else {
      const { data, error } = await retryNetwork(
        `create media for ${item.product.sku}`,
        () =>
          supabase
            .from("product_media")
            .insert(mediaPayload)
            .select("id")
            .single(),
      );
      if (error)
        throw new Error(
          `Could not create media for ${item.product.sku}: ${error.message}`,
        );
      mediaId = data.id;
    }

    const productMedia = groupedPrepared.get(item.product.sku) ?? [];
    productMedia.push({ ...item, mediaId });
    groupedPrepared.set(item.product.sku, productMedia);
    if (
      (transferIndex + 1) % 10 === 0 ||
      transferIndex + 1 === prepared.length
    ) {
      console.log(`Uploaded ${transferIndex + 1}/${prepared.length} images.`);
    }
  });

  await mapWithLimit(config.manifest, 6, async (product) => {
    const productId = productIds.get(product.sku);
    const primary = groupedPrepared
      .get(product.sku)
      ?.find((item) => item.index === 0);
    if (!primary)
      throw new Error(`Primary media is missing for ${product.sku}.`);
    const { error: primaryError } = await retryNetwork(
      `set primary media for ${product.sku}`,
      () =>
        supabase.rpc("set_product_primary_media", {
          p_media_id: primary.mediaId,
          p_product_id: productId,
        }),
    );
    if (primaryError) {
      throw new Error(
        `Could not set primary media for ${product.sku}: ${primaryError.message}`,
      );
    }
  });

  await config.afterMedia?.({
    categoryId: category.id,
    ids,
    productIds,
    supabase,
  });

  const { error: publishError } = await retryNetwork(
    "publish imported products",
    () =>
      supabase
        .from("products")
        .update({ archived_at: null, status: "published" })
        .in("id", ids),
  );
  if (publishError)
    throw new Error(`Could not publish products: ${publishError.message}`);
  console.log(
    `Published ${config.manifest.length}/${config.manifest.length} products.`,
  );

  await config.afterPublish?.({ ids, productIds, supabase });
}

/**
 * Runs one batch end to end. Without `--apply` it stops after writing the local
 * WebP derivatives, so the conversion can always be reviewed before anything
 * reaches Supabase.
 */
export async function runImport(config) {
  if (!existsSync(envPath)) {
    throw new Error(`Missing ${envPath}.`);
  }
  process.loadEnvFile(envPath);

  const sourceRoot = join(root, "Diverso-Products-images", config.sourceDir);
  const applyToDatabase = process.argv.includes("--apply");
  const refreshMedia = process.argv.includes("--refresh-media");

  validateManifest(config, sourceRoot);
  const prepared = await prepareAssets(config, sourceRoot);

  if (applyToDatabase) {
    await applyCatalog(config, prepared, refreshMedia);
    console.log(`The ${config.label} catalog was uploaded and published.`);
  } else {
    console.log(
      "Preparation complete. Re-run with --apply to update Supabase.",
    );
  }
}
