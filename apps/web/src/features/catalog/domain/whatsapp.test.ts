import { describe, expect, it } from "vitest";

import type { InquirySnapshotItem } from "./types";
import {
  buildShortlistMessage,
  buildSingleProductMessage,
  buildWhatsAppHref,
  toInternationalDigits,
} from "./whatsapp";

const item: InquirySnapshotItem = {
  availabilityLabel: "In store",
  brand: "Demo Aurora",
  name: "Demo Frame 01",
  priceLabel: "PKR 18,500",
  sku: "DEMO-EYE-001",
  slug: "demo-frame-01",
  url: "https://example.test/products/demo-frame-01",
  variantSku: "DEMO-EYE-001-BLK",
};

describe("single product message", () => {
  it("carries every fact the person answering needs", () => {
    // AGENTS.md requires the message to hold product, model, variant and URL so
    // the customer never has to retype the product they are asking about.
    const message = buildSingleProductMessage(item, "AB12CD34");

    expect(message).toContain("Demo Aurora Demo Frame 01");
    expect(message).toContain("Model/SKU: DEMO-EYE-001");
    expect(message).toContain("Variant: DEMO-EYE-001-BLK");
    expect(message).toContain("Price shown: PKR 18,500");
    expect(message).toContain(item.url);
    expect(message).toContain("Ref: AB12CD34");
  });

  it("states plainly when no variant or price is selected", () => {
    const message = buildSingleProductMessage(
      { ...item, priceLabel: null, variantSku: null },
      null,
    );

    expect(message).toContain("Variant: not selected");
    expect(message).toContain("Price shown: price on inquiry");
    expect(message).not.toContain("Ref:");
  });
});

describe("shortlist message", () => {
  it("numbers each item and keeps the optional note", () => {
    const message = buildShortlistMessage(
      [item, { ...item, name: "Demo Watch 01", slug: "demo-watch-01" }],
      "Under PKR 100,000",
      "EF56GH78",
    );

    expect(message).toContain("1. Demo Aurora Demo Frame 01");
    expect(message).toContain("2. Demo Aurora Demo Watch 01");
    expect(message).toContain("My preference/budget: Under PKR 100,000");
    expect(message).toContain("Ref: EF56GH78");
  });

  it("omits the note line when the visitor left it blank", () => {
    expect(buildShortlistMessage([item], null, null)).not.toContain(
      "My preference/budget",
    );
  });
});

describe("click to chat links", () => {
  it("encodes the message into the official wa.me form", () => {
    const href = buildWhatsAppHref("+92 333 5777710", "Hello there");

    expect(href.startsWith("https://wa.me/923335777710?text=")).toBe(true);
    expect(new URL(href).searchParams.get("text")).toBe("Hello there");
  });

  it("refuses a destination that holds no digits", () => {
    expect(() => buildWhatsAppHref("not a number", "hi")).toThrow();
  });

  it("converts a local number to international digits", () => {
    // Settings may store either form; WhatsApp rejects the local one.
    expect(toInternationalDigits("03438067821")).toBe("923438067821");
    expect(toInternationalDigits("+92 333 5777710")).toBe("923335777710");
    expect(toInternationalDigits("")).toBeNull();
  });
});
