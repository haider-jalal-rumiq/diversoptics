import { z } from "zod";

export const MAX_MEDIA_SOURCE_BYTES = 15 * 1024 * 1024;
export const MAX_MEDIA_SOURCE_PIXELS = 40_000_000;
export const MEDIA_UPLOAD_MIME_TYPES = [
  "image/avif",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type MediaUploadMimeType = (typeof MEDIA_UPLOAD_MIME_TYPES)[number];

const sourceExtensions: Record<MediaUploadMimeType, string> = {
  "image/avif": "avif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const mediaUploadIntentSchema = z.object({
  byteSize: z.number().int().positive().max(MAX_MEDIA_SOURCE_BYTES),
  mimeType: z.enum(MEDIA_UPLOAD_MIME_TYPES),
});

export function getMediaSourceExtension(mimeType: MediaUploadMimeType) {
  return sourceExtensions[mimeType];
}

/** Prevents a finalize request from processing another product's staged file. */
export function isExpectedMediaSourcePath(
  productId: number,
  sourcePath: string,
  mimeType: MediaUploadMimeType,
) {
  const extension = getMediaSourceExtension(mimeType);
  const uuid =
    "[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}";
  return new RegExp(
    `^${productId}/originals/${uuid}\\.${extension}$`,
    "i",
  ).test(sourcePath);
}
