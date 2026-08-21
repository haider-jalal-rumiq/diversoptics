"use server";

import { createHash } from "node:crypto";

import { revalidatePath } from "next/cache";
import sharp, { type Metadata, type OutputInfo } from "sharp";
import { z } from "zod";

import { requireCatalogEditor } from "@/features/cms/auth/staff";
import {
  isExpectedMediaSourcePath,
  MAX_MEDIA_SOURCE_BYTES,
  MAX_MEDIA_SOURCE_PIXELS,
  MEDIA_UPLOAD_MIME_TYPES,
  type MediaUploadMimeType,
} from "@/features/cms/domain/media-upload";
import { createClient } from "@/lib/supabase/server";

const mediaFormSchema = z.object({
  altText: z.string().trim().min(5).max(220),
  makePrimary: z.boolean(),
  rightsApproved: z.boolean(),
  sourceByteSize: z.coerce
    .number()
    .int()
    .positive()
    .max(MAX_MEDIA_SOURCE_BYTES),
  sourceMimeType: z.enum(MEDIA_UPLOAD_MIME_TYPES),
  sourcePath: z.string().trim().min(1).max(300),
});

export type MediaActionState = { message?: string; success?: boolean };

function metadataMatchesMime(
  metadata: Metadata,
  mimeType: MediaUploadMimeType,
) {
  if (mimeType === "image/avif") {
    return metadata.format === "heif" && metadata.compression === "av1";
  }

  return metadata.format === mimeType.replace("image/", "");
}

export async function finalizeProductMedia(
  productId: number,
  _previousState: MediaActionState,
  formData: FormData,
): Promise<MediaActionState> {
  await requireCatalogEditor();

  if (!Number.isSafeInteger(productId) || productId <= 0) {
    return { message: "The product reference is invalid." };
  }

  const parsed = mediaFormSchema.safeParse({
    altText: formData.get("altText"),
    makePrimary: formData.get("makePrimary") === "on",
    rightsApproved: formData.get("rightsApproved") === "on",
    sourceByteSize: formData.get("sourceByteSize"),
    sourceMimeType: formData.get("sourceMimeType"),
    sourcePath: formData.get("sourcePath"),
  });

  if (!parsed.success) {
    return {
      message: parsed.error.issues[0]?.message ?? "Check the media fields.",
    };
  }

  if (
    !isExpectedMediaSourcePath(
      productId,
      parsed.data.sourcePath,
      parsed.data.sourceMimeType,
    )
  ) {
    return {
      message: "The private source path could not be verified.",
    };
  }

  if (parsed.data.makePrimary && !parsed.data.rightsApproved) {
    return { message: "Only rights-approved media can become primary." };
  }

  const supabase = await createClient();
  const sourceDownload = await supabase.storage
    .from("catalog-source")
    .download(parsed.data.sourcePath);

  if (sourceDownload.error) {
    return { message: "The private original could not be read." };
  }

  const sourceBuffer = Buffer.from(await sourceDownload.data.arrayBuffer());
  if (
    sourceBuffer.byteLength !== parsed.data.sourceByteSize ||
    sourceBuffer.byteLength > MAX_MEDIA_SOURCE_BYTES
  ) {
    await supabase.storage
      .from("catalog-source")
      .remove([parsed.data.sourcePath]);
    return { message: "The uploaded file size could not be verified." };
  }

  let metadata: Metadata;

  try {
    metadata = await sharp(sourceBuffer, { failOn: "warning" }).metadata();
  } catch {
    await supabase.storage
      .from("catalog-source")
      .remove([parsed.data.sourcePath]);
    return { message: "The selected file is not a valid supported image." };
  }

  if (
    !metadata.width ||
    !metadata.height ||
    !metadataMatchesMime(metadata, parsed.data.sourceMimeType)
  ) {
    await supabase.storage
      .from("catalog-source")
      .remove([parsed.data.sourcePath]);
    return { message: "The image dimensions could not be verified." };
  }

  if (metadata.width * metadata.height > MAX_MEDIA_SOURCE_PIXELS) {
    await supabase.storage
      .from("catalog-source")
      .remove([parsed.data.sourcePath]);
    return { message: "The image dimensions are too large to process safely." };
  }

  let derivative: { data: Buffer; info: OutputInfo };
  try {
    derivative = await sharp(sourceBuffer, { failOn: "warning" })
      .rotate()
      .resize({
        fit: "inside",
        height: 1_800,
        width: 1_800,
        withoutEnlargement: true,
      })
      .webp({ effort: 5, quality: 84 })
      .toBuffer({ resolveWithObject: true });
  } catch {
    await supabase.storage
      .from("catalog-source")
      .remove([parsed.data.sourcePath]);
    return { message: "The catalog derivative could not be generated safely." };
  }

  const hash = createHash("sha256").update(sourceBuffer).digest("hex");
  const publicPath = `${productId}/${hash.slice(0, 24)}.webp`;

  const publicUpload = await supabase.storage
    .from("catalog-public")
    .upload(publicPath, derivative.data, {
      cacheControl: "31536000",
      contentType: "image/webp",
      upsert: true,
    });

  if (publicUpload.error) {
    await supabase.storage
      .from("catalog-source")
      .remove([parsed.data.sourcePath]);
    return { message: "The optimized catalog image could not be uploaded." };
  }

  const insertResult = await supabase
    .from("product_media")
    .insert({
      alt_text: parsed.data.altText,
      byte_size: derivative.data.byteLength,
      height: derivative.info.height,
      is_primary: false,
      mime_type: "image/webp",
      product_id: productId,
      public_path: publicPath,
      rights_status: parsed.data.rightsApproved ? "approved" : "pending",
      source_path: parsed.data.sourcePath,
      width: derivative.info.width,
    })
    .select("id")
    .single();

  if (insertResult.error) {
    await Promise.all([
      supabase.storage.from("catalog-source").remove([parsed.data.sourcePath]),
      supabase.storage.from("catalog-public").remove([publicPath]),
    ]);
    return { message: "The media record could not be created." };
  }

  if (parsed.data.makePrimary) {
    const primaryResult = await supabase.rpc("set_product_primary_media", {
      p_media_id: insertResult.data.id,
      p_product_id: productId,
    });

    if (primaryResult.error) {
      return {
        message:
          "The image was uploaded, but could not become primary. Select it below.",
      };
    }
  }

  revalidatePath(`/cms/products/${productId}`);
  revalidatePath(`/cms/products/${productId}/media`);
  revalidatePath("/cms/media");
  return { message: "Image processed and uploaded.", success: true };
}

export async function makePrimary(productId: number, mediaId: number) {
  await requireCatalogEditor();
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_product_primary_media", {
    p_media_id: mediaId,
    p_product_id: productId,
  });

  if (error) {
    throw new Error("Only an approved product image can become primary.");
  }

  revalidatePath(`/cms/products/${productId}`);
  revalidatePath(`/cms/products/${productId}/media`);
}

export async function archiveMedia(productId: number, mediaId: number) {
  await requireCatalogEditor();
  const supabase = await createClient();
  const { error } = await supabase
    .from("product_media")
    .update({ archived_at: new Date().toISOString(), is_primary: false })
    .eq("id", mediaId)
    .eq("product_id", productId);

  if (error) {
    throw new Error("The media item could not be archived.");
  }

  revalidatePath(`/cms/products/${productId}`);
  revalidatePath(`/cms/products/${productId}/media`);
  revalidatePath("/cms/media");
}
