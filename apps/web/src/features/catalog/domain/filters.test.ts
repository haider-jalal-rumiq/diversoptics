import { describe, expect, it } from "vitest";

import {
  countActiveFilters,
  DEFAULT_CATALOG_FILTERS,
  parseCatalogFilters,
  serializeCatalogFilters,
  toggleAvailabilityFilter,
  toggleBrandFilter,
} from "./filters";

describe("parsing catalog filters", () => {
  it("defaults an empty query string to featured page one", () => {
    expect(parseCatalogFilters({})).toEqual(DEFAULT_CATALOG_FILTERS);
  });

  it("accepts repeated and comma separated brand values", () => {
    expect(
      parseCatalogFilters({ brand: ["a-brand", "b-brand"] }).brandSlugs,
    ).toEqual(["a-brand", "b-brand"]);
    expect(
      parseCatalogFilters({ brand: "a-brand,b-brand" }).brandSlugs,
    ).toEqual(["a-brand", "b-brand"]);
  });

  it("drops values that are not valid slugs", () => {
    // A hand-edited or crawled URL must never reach the query builder with
    // arbitrary input.
    const state = parseCatalogFilters({
      brand: ["Valid-Brand", "bad brand", "../etc", "ok-brand"],
    });

    expect(state.brandSlugs).toEqual(["valid-brand", "ok-brand"]);
  });

  it("ignores unknown sort and availability values", () => {
    const state = parseCatalogFilters({
      availability: ["in_store", "teleported"],
      sort: "cheapest",
    });

    expect(state.availability).toEqual(["in_store"]);
    expect(state.sort).toBe("featured");
  });

  it("clamps a hostile page number", () => {
    expect(parseCatalogFilters({ page: "0" }).page).toBe(1);
    expect(parseCatalogFilters({ page: "-5" }).page).toBe(1);
    expect(parseCatalogFilters({ page: "abc" }).page).toBe(1);
    expect(parseCatalogFilters({ page: "999999" }).page).toBe(200);
  });

  it("truncates an oversized query", () => {
    expect(parseCatalogFilters({ q: "x".repeat(500) }).query).toHaveLength(80);
  });

  it("deduplicates repeated brand values", () => {
    expect(
      parseCatalogFilters({ brand: ["a-brand", "a-brand"] }).brandSlugs,
    ).toEqual(["a-brand"]);
  });
});

describe("serializing catalog filters", () => {
  it("keeps a default listing URL clean", () => {
    expect(serializeCatalogFilters(DEFAULT_CATALOG_FILTERS)).toBe("");
  });

  it("round trips through parsing", () => {
    const state = {
      availability: ["in_store", "ask"],
      brandSlugs: ["b-brand", "a-brand"],
      page: 3,
      query: "demo",
      sort: "price_asc",
    } as const;

    const serialized = serializeCatalogFilters(state);
    const params = Object.fromEntries(
      [...new URLSearchParams(serialized.slice(1)).keys()].map((key) => [
        key,
        new URLSearchParams(serialized.slice(1)).getAll(key),
      ]),
    );

    const parsed = parseCatalogFilters(params);

    expect(parsed.query).toBe("demo");
    expect(parsed.sort).toBe("price_asc");
    expect(parsed.page).toBe(3);
    // Serialization sorts brands so one selection has exactly one canonical URL.
    expect(parsed.brandSlugs).toEqual(["a-brand", "b-brand"]);
    expect(parsed.availability).toEqual(["in_store", "ask"]);
  });

  it("applies overrides without mutating the source state", () => {
    const state = { ...DEFAULT_CATALOG_FILTERS, page: 2 };

    expect(serializeCatalogFilters(state, { page: 1 })).toBe("");
    expect(state.page).toBe(2);
  });
});

describe("toggling filters", () => {
  it("returns to page one so the visitor does not land past the results", () => {
    const state = { ...DEFAULT_CATALOG_FILTERS, page: 4 };

    expect(toggleBrandFilter(state, "a-brand").page).toBe(1);
    expect(toggleAvailabilityFilter(state, "in_store").page).toBe(1);
  });

  it("adds then removes a value", () => {
    const added = toggleBrandFilter(DEFAULT_CATALOG_FILTERS, "a-brand");

    expect(added.brandSlugs).toEqual(["a-brand"]);
    expect(toggleBrandFilter(added, "a-brand").brandSlugs).toEqual([]);
  });

  it("counts the active facets a mobile drawer badge shows", () => {
    const state = parseCatalogFilters({
      availability: "in_store",
      brand: "a-brand,b-brand",
      q: "demo",
    });

    expect(countActiveFilters(state)).toBe(4);
  });
});
