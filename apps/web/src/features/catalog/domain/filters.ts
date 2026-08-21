import type { Availability, CatalogFilterState, CatalogSort } from "./types";

export const CATALOG_PAGE_SIZE = 24;

/** A deep page offset is expensive and no real visitor reaches it. */
const MAX_PAGE = 200;
const MAX_QUERY_LENGTH = 80;
const MAX_BRAND_FILTERS = 12;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const CATALOG_SORTS = [
  "featured",
  "newest",
  "price_asc",
  "price_desc",
] as const satisfies readonly CatalogSort[];

export const AVAILABILITY_VALUES = [
  "in_store",
  "available_to_order",
  "out_of_stock",
  "ask",
] as const satisfies readonly Availability[];

export const SORT_LABELS: Record<CatalogSort, string> = {
  featured: "Featured",
  newest: "Newest",
  price_asc: "Price: low to high",
  price_desc: "Price: high to low",
};

export type RawSearchParams = Record<
  string,
  string | readonly string[] | undefined
>;

export const DEFAULT_CATALOG_FILTERS: CatalogFilterState = {
  availability: [],
  brandSlugs: [],
  page: 1,
  query: null,
  sort: "featured",
};

function readValues(params: RawSearchParams, key: string): readonly string[] {
  const raw = params[key];

  if (raw === undefined) return [];

  const entries = Array.isArray(raw) ? raw : [raw];

  // Both `?brand=a&brand=b` and `?brand=a,b` are accepted so a shared link keeps
  // working whichever form produced it.
  return entries
    .flatMap((entry) => entry.split(","))
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

function readSingle(params: RawSearchParams, key: string): string | null {
  const raw = params[key];
  const value = Array.isArray(raw) ? raw[0] : raw;

  return value?.trim() ? value.trim() : null;
}

/**
 * Every value is validated against a known set. An unrecognised filter is
 * dropped rather than passed to the database, so a hand-edited or crawled URL
 * cannot reach a query builder with arbitrary input.
 */
export function parseCatalogFilters(
  params: RawSearchParams,
): CatalogFilterState {
  const query = readSingle(params, "q");
  const sort = readSingle(params, "sort");
  const page = Number.parseInt(readSingle(params, "page") ?? "", 10);

  const brandSlugs = Array.from(
    new Set(
      readValues(params, "brand").filter((slug) => SLUG_PATTERN.test(slug)),
    ),
  ).slice(0, MAX_BRAND_FILTERS);

  const availability = AVAILABILITY_VALUES.filter((value) =>
    readValues(params, "availability").includes(value),
  );

  return {
    availability,
    brandSlugs,
    page: Number.isInteger(page) && page >= 1 ? Math.min(page, MAX_PAGE) : 1,
    query: query ? query.slice(0, MAX_QUERY_LENGTH) : null,
    sort: CATALOG_SORTS.find((value) => value === sort) ?? "featured",
  };
}

/**
 * Only non-default values are written back, which keeps a canonical listing URL
 * free of noise that would otherwise fragment crawling and caching.
 */
export function serializeCatalogFilters(
  state: CatalogFilterState,
  overrides: Partial<CatalogFilterState> = {},
): string {
  const next = { ...state, ...overrides };
  const params = new URLSearchParams();

  if (next.query) params.set("q", next.query);

  for (const slug of [...next.brandSlugs].sort()) {
    params.append("brand", slug);
  }

  for (const value of AVAILABILITY_VALUES) {
    if (next.availability.includes(value)) params.append("availability", value);
  }

  if (next.sort !== "featured") params.set("sort", next.sort);
  if (next.page > 1) params.set("page", String(next.page));

  const serialized = params.toString();

  return serialized ? `?${serialized}` : "";
}

/**
 * Toggling a facet always returns to page one; keeping the old offset would
 * usually land the visitor on an empty page.
 */
export function toggleBrandFilter(
  state: CatalogFilterState,
  slug: string,
): CatalogFilterState {
  const active = state.brandSlugs.includes(slug);

  return {
    ...state,
    brandSlugs: active
      ? state.brandSlugs.filter((value) => value !== slug)
      : [...state.brandSlugs, slug].slice(0, MAX_BRAND_FILTERS),
    page: 1,
  };
}

export function toggleAvailabilityFilter(
  state: CatalogFilterState,
  value: Availability,
): CatalogFilterState {
  const active = state.availability.includes(value);

  return {
    ...state,
    availability: active
      ? state.availability.filter((entry) => entry !== value)
      : AVAILABILITY_VALUES.filter(
          (entry) => entry === value || state.availability.includes(entry),
        ),
    page: 1,
  };
}

export function countActiveFilters(state: CatalogFilterState): number {
  return (
    state.brandSlugs.length + state.availability.length + (state.query ? 1 : 0)
  );
}

export function hasActiveFilters(state: CatalogFilterState): boolean {
  return countActiveFilters(state) > 0;
}
