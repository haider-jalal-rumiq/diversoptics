import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { demoProducts } from "@/features/catalog/data/demo-fixtures";

import { ProductCard } from "./product-card";

const [product] = demoProducts;

if (!product)
  throw new Error("The demo fixtures must expose at least one product.");

describe("ProductCard", () => {
  it("exposes fixture identity and a usable detail link", () => {
    render(<ProductCard product={product} />);

    expect(
      screen.getByRole("heading", { name: product.name }),
    ).toBeInTheDocument();
    expect(screen.getByText(product.sku)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View details" })).toHaveAttribute(
      "href",
      product.href,
    );
  });

  it("does not present an unfinished shortlist control as active", () => {
    render(<ProductCard product={product} />);

    expect(
      screen.getByRole("button", { name: /shortlist preview/i }),
    ).toBeDisabled();
  });
});
