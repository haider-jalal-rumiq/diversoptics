import { describe, expect, it } from "vitest";

import { montblancPens } from "./montblanc-pens-2026-04-06.mjs";

describe("Montblanc pens import manifest", () => {
  it("maps every supplied image to one reconciled product", () => {
    const skus = montblancPens.map((product) => product.sku);
    const files = montblancPens.flatMap((product) => product.files);

    expect(montblancPens).toHaveLength(89);
    expect(files).toHaveLength(102);
    expect(new Set(skus).size).toBe(89);
    expect(new Set(files).size).toBe(102);
  });

  it("keeps price and inventory conflicts inquiry-only", () => {
    const conflictingProduct = montblancPens.find(
      (product) => product.sku === "198354",
    );

    expect(conflictingProduct).toMatchObject({ price: null, quantity: null });
  });

  it("never pairs a non-positive fixed price with a product", () => {
    const invalid = montblancPens.filter(
      (product) => product.price !== null && product.price <= 0,
    );

    expect(invalid).toEqual([]);
  });
});
