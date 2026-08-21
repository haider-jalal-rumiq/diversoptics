import { getSupabasePublicConfig } from "@/lib/supabase/config";

import type { CatalogImage } from "./types";

/**
 * Phase 02 stores originals in a private bucket and serves only approved WebP
 * derivatives from this public one, so the catalog never links a source file.
 */
const PUBLIC_BUCKET = "catalog-public";

export function buildStorageImageUrl(
  path: string | null,
  baseUrl = getSupabasePublicConfig()?.url,
): string | null {
  if (!path || !baseUrl) return null;

  const normalizedPath = path.replace(/^\/+/, "");

  // A stored path is content-hashed and relative. Anything that tries to escape
  // the bucket or point at another host is treated as unusable rather than
  // rendered, so a bad CMS row cannot turn into an off-site image request.
  if (!normalizedPath || normalizedPath.includes("..")) return null;
  if (/^[a-z][a-z0-9+.-]*:/i.test(normalizedPath)) return null;

  const base = baseUrl.replace(/\/+$/, "");

  return `${base}/storage/v1/object/public/${PUBLIC_BUCKET}/${normalizedPath}`;
}

export function resolveImageUrl(
  image: CatalogImage | null,
  baseUrl?: string,
): string | null {
  return image ? buildStorageImageUrl(image.path, baseUrl) : null;
}

/**
 * Focal point is stored as a 0–1 pair so a tall product can stay centred on the
 * part that matters when a card crops it.
 */
export function focalObjectPosition(image: CatalogImage): string {
  const clamp = (value: number) => Math.min(100, Math.max(0, value * 100));

  return `${clamp(image.focalX).toFixed(2)}% ${clamp(image.focalY).toFixed(2)}%`;
}
