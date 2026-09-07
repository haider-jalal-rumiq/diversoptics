import { render, screen } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import type { CatalogImage } from "@/features/catalog/domain/types";

import { ProductGallery } from "./product-gallery";

const portraitImage: CatalogImage = {
  altText: "Portrait product artwork",
  focalX: 0.5,
  focalY: 0.5,
  height: 1402,
  id: "portrait-product",
  path: "products/portrait-product.webp",
  width: 1122,
};

describe("ProductGallery", () => {
  beforeAll(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      "test-publishable-key-long-enough",
    );
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it("shows the complete portrait artwork instead of cropping it", () => {
    render(
      <ProductGallery
        images={[portraitImage]}
        productName="Portrait product"
      />,
    );

    const image = screen.getByRole("img", {
      name: portraitImage.altText,
    });

    expect(image).toHaveClass("object-contain");
    expect(image).not.toHaveClass("object-cover");
  });
});
