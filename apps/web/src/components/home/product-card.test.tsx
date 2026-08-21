import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { demoProducts } from "@/features/catalog/data/demo-fixtures";

import { ProductCard } from "./product-card";

describe("ProductCard", () => {
  it("exposes fixture identity and a usable detail link", () => {
    const product = demoProducts[0];
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
    render(<ProductCard product={demoProducts[0]} />);

    expect(
      screen.getByRole("button", { name: /shortlist preview/i }),
    ).toBeDisabled();
  });
});
