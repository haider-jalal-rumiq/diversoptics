import { describe, expect, it } from "vitest";

import {
  createSlug,
  productFormSchema,
} from "@/features/cms/domain/product-form";

const validProduct = {
  availability: "ask",
  brandId: null,
  categoryId: "1",
  currency: "PKR",
  description: "",
  eyebrow: "",
  featured: false,
  modelNumber: "RB-001",
  name: "Orbit Frame",
  price: "",
  priceMode: "on_inquiry",
  shortDescription: "",
  sku: "RB-001-BLK",
  slug: "orbit-frame",
  status: "draft",
  updatedAt: null,
} as const;

describe("product form domain", () => {
  it("creates stable URL slugs", () => {
    expect(createSlug(" Ray-Ban / Aviator  Classic ")).toBe(
      "ray-ban-aviator-classic",
    );
  });

  it("requires a price only for fixed and from modes", () => {
    expect(productFormSchema.safeParse(validProduct).success).toBe(true);
    expect(
      productFormSchema.safeParse({
        ...validProduct,
        priceMode: "fixed",
      }).success,
    ).toBe(false);
  });

  it("rejects prices when copy must remain inquiry-led", () => {
    expect(
      productFormSchema.safeParse({ ...validProduct, price: "100" }).success,
    ).toBe(false);
  });
});
