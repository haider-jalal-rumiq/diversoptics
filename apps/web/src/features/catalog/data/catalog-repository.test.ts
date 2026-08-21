import { describe, expect, it } from "vitest";

import {
  createCatalogRepository,
  formatPriceLabel,
} from "./catalog-repository";

describe("catalog repository environment boundary", () => {
  it("exposes explicit demo fixtures in previews", async () => {
    const products =
      await createCatalogRepository("preview").getFeaturedProducts();

    expect(products).toHaveLength(3);
    expect(products.every((product) => product.demo)).toBe(true);
    expect(products.every((product) => product.sku.startsWith("DEMO-"))).toBe(
      true,
    );
  });

  it("never exposes demo fixtures in production", async () => {
    const repository = createCatalogRepository("production");

    await expect(repository.getFeaturedProducts()).resolves.toEqual([]);
    await expect(repository.getCategories()).resolves.toEqual([]);
  });

  it("uses safe price copy for unverified fixture pricing", () => {
    expect(formatPriceLabel({ priceMode: "on_inquiry" })).toBe(
      "Price on inquiry",
    );
    expect(formatPriceLabel({ priceMode: "hidden" })).toBeNull();
  });
});
