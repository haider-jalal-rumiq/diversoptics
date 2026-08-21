import type { ShortlistEntry } from "./types";

/**
 * docs/04 caps a useful comparison at roughly six items and forbids presenting
 * this as a cart or a reservation, so it stays a browser-local selection.
 */
export const SHORTLIST_LIMIT = 6;

export const SHORTLIST_STORAGE_KEY = "diverso.shortlist.v1";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_VARIANT_SKU_LENGTH = 64;

function normalizeEntry(value: unknown): ShortlistEntry | null {
  if (typeof value !== "object" || value === null) return null;

  const candidate = value as Record<string, unknown>;
  const slug =
    typeof candidate.slug === "string"
      ? candidate.slug.trim().toLowerCase()
      : "";

  if (!SLUG_PATTERN.test(slug)) return null;

  const variantSku =
    typeof candidate.variantSku === "string" && candidate.variantSku.trim()
      ? candidate.variantSku.trim().slice(0, MAX_VARIANT_SKU_LENGTH)
      : null;

  return { slug, variantSku };
}

/**
 * Stored shortlists come from a previous visit and may be stale, hand-edited or
 * written by an older release, so every entry is re-validated rather than
 * trusted. Unusable entries are dropped instead of failing the whole read.
 */
export function parseShortlist(raw: string | null): readonly ShortlistEntry[] {
  if (!raw) return [];

  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) return [];

  const entries: ShortlistEntry[] = [];
  const seen = new Set<string>();

  for (const value of parsed) {
    const entry = normalizeEntry(value);

    if (!entry || seen.has(entry.slug)) continue;

    seen.add(entry.slug);
    entries.push(entry);

    if (entries.length === SHORTLIST_LIMIT) break;
  }

  return entries;
}

export function serializeShortlist(entries: readonly ShortlistEntry[]): string {
  return JSON.stringify(entries);
}

export function isShortlisted(
  entries: readonly ShortlistEntry[],
  slug: string,
): boolean {
  return entries.some((entry) => entry.slug === slug);
}

/**
 * Re-adding a product updates its variant rather than duplicating the row, and a
 * full shortlist keeps its existing contents instead of silently evicting one.
 */
export function addToShortlist(
  entries: readonly ShortlistEntry[],
  entry: ShortlistEntry,
): readonly ShortlistEntry[] {
  const normalized = normalizeEntry(entry);

  if (!normalized) return entries;

  if (isShortlisted(entries, normalized.slug)) {
    return entries.map((existing) =>
      existing.slug === normalized.slug ? normalized : existing,
    );
  }

  if (entries.length >= SHORTLIST_LIMIT) return entries;

  return [...entries, normalized];
}

export function removeFromShortlist(
  entries: readonly ShortlistEntry[],
  slug: string,
): readonly ShortlistEntry[] {
  return entries.filter((entry) => entry.slug !== slug);
}

export function toggleShortlist(
  entries: readonly ShortlistEntry[],
  entry: ShortlistEntry,
): readonly ShortlistEntry[] {
  return isShortlisted(entries, entry.slug)
    ? removeFromShortlist(entries, entry.slug)
    : addToShortlist(entries, entry);
}
