import { describe, expect, it } from "vitest";

import {
  formatAvailabilityLabel,
  formatPriceLabel,
  formatVariantPriceLabel,
} from "./price";

const base = { currency: "PKR", price: 18500, priceMode: "fixed" } as const;

describe("price labels", () => {
  it("never renders an empty or zero price", () => {
    // docs/04 forbids showing a blank or zero price, so a row whose mode expects
    // an amount but has none must degrade to the inquiry wording.
    expect(formatPriceLabel({ ...base, price: null })).toBe("Price on inquiry");
    expect(formatPriceLabel({ ...base, price: 0 })).toBe("Price on inquiry");
    expect(formatPriceLabel({ ...base, price: -10 })).toBe("Price on inquiry");
  });

  it("uses the approved copy for the non-numeric modes", () => {
    expect(formatPriceLabel({ ...base, priceMode: "on_inquiry" })).toBe(
      "Price on inquiry",
    );
    expect(formatPriceLabel({ ...base, priceMode: "hidden" })).toBeNull();
  });

  it("marks a starting price as a range", () => {
    const fixed = formatPriceLabel(base);
    const from = formatPriceLabel({ ...base, priceMode: "from" });

    expect(fixed).toContain("18,500");
    expect(from).toBe(`From ${fixed}`);
  });

  it("keeps a half-rupee amount instead of rounding it away", () => {
    expect(formatPriceLabel({ ...base, price: 1250.5 })).toContain("1,250.50");
    expect(formatPriceLabel(base)).not.toContain(".00");
  });

  it("survives an unusable currency code", () => {
    expect(formatPriceLabel({ ...base, currency: "not-a-currency" })).toContain(
      "18500",
    );
  });
});

describe("variant price labels", () => {
  const variant = {
    availability: "in_store",
    id: "v1",
    name: "Black",
    price: null,
    priceMode: null,
    sku: "SKU-BLK",
  } as const;

  it("inherits the product price when the variant has none", () => {
    expect(formatVariantPriceLabel(base, variant)).toBe(formatPriceLabel(base));
    expect(formatVariantPriceLabel(base, null)).toBe(formatPriceLabel(base));
  });

  it("prefers the variant override", () => {
    const label = formatVariantPriceLabel(base, {
      ...variant,
      price: 21000,
      priceMode: "fixed",
    });

    expect(label).toContain("21,000");
  });

  it("lets a variant hide a price the product shows", () => {
    expect(
      formatVariantPriceLabel(base, { ...variant, priceMode: "on_inquiry" }),
    ).toBe("Price on inquiry");
  });
});

describe("availability labels", () => {
  it("gives each state a precise meaning", () => {
    expect(formatAvailabilityLabel("in_store")).toBe("In store");
    expect(formatAvailabilityLabel("available_to_order")).toBe(
      "Available to order",
    );
    expect(formatAvailabilityLabel("out_of_stock")).toBe("Out of stock");
    expect(formatAvailabilityLabel("ask")).toBe("Ask for status");
  });
});
