import { describe, expect, it } from "vitest";

import { summarizeInquiries, type InquiryEventRecord } from "./inquiry-metrics";

const NOW = Date.parse("2026-08-22T12:00:00.000Z");

function daysAgo(days: number): string {
  return new Date(NOW - days * 24 * 60 * 60 * 1000).toISOString();
}

function event(
  overrides: Partial<InquiryEventRecord> = {},
): InquiryEventRecord {
  return {
    campaign: {},
    catalogSnapshot: [{ name: "Demo Frame 01", slug: "demo-frame-01" }],
    createdAt: daysAgo(1),
    entryPath: "/products/demo-frame-01",
    eventType: "single_product",
    publicId: "AAAAAAAAAAAA",
    ...overrides,
  };
}

describe("summarizing inquiries", () => {
  it("returns zeroes for no events", () => {
    const summary = summarizeInquiries([], NOW);

    expect(summary.total).toBe(0);
    expect(summary.productsAsked).toBe(0);
    expect(summary.topProducts).toEqual([]);
  });

  it("splits single product and shortlist inquiries", () => {
    const summary = summarizeInquiries(
      [event(), event(), event({ eventType: "shortlist" })],
      NOW,
    );

    expect(summary.total).toBe(3);
    expect(summary.singleProduct).toBe(2);
    expect(summary.shortlist).toBe(1);
  });

  it("counts rolling windows from the injected clock", () => {
    const summary = summarizeInquiries(
      [
        event({ createdAt: daysAgo(1) }),
        event({ createdAt: daysAgo(6) }),
        event({ createdAt: daysAgo(20) }),
        event({ createdAt: daysAgo(90) }),
      ],
      NOW,
    );

    expect(summary.last7Days).toBe(2);
    expect(summary.last30Days).toBe(3);
    expect(summary.total).toBe(4);
  });

  it("leaves an unparseable timestamp out of the windows", () => {
    // Counting it as "just now" would quietly inflate the recent figures.
    const summary = summarizeInquiries(
      [event({ createdAt: "not a date" })],
      NOW,
    );

    expect(summary.total).toBe(1);
    expect(summary.last7Days).toBe(0);
    expect(summary.last30Days).toBe(0);
  });

  it("ranks products by how often they are asked about", () => {
    const summary = summarizeInquiries(
      [
        event(),
        event(),
        event({
          catalogSnapshot: [{ name: "Demo Watch 01", slug: "demo-watch-01" }],
        }),
      ],
      NOW,
    );

    expect(summary.topProducts[0]).toEqual({
      count: 2,
      label: "Demo Frame 01",
    });
    expect(summary.productsAsked).toBe(2);
  });

  it("counts every product in a shortlist inquiry", () => {
    const summary = summarizeInquiries(
      [
        event({
          catalogSnapshot: [
            { name: "A", slug: "a" },
            { name: "B", slug: "b" },
          ],
          eventType: "shortlist",
        }),
      ],
      NOW,
    );

    expect(summary.total).toBe(1);
    expect(summary.productsAsked).toBe(2);
  });

  it("falls back to the slug when a snapshot carries no name", () => {
    const summary = summarizeInquiries(
      [event({ catalogSnapshot: [{ slug: "unnamed-product" }] })],
      NOW,
    );

    expect(summary.topProducts[0]?.label).toBe("unnamed-product");
  });

  it("labels an inquiry with no campaign as direct", () => {
    const summary = summarizeInquiries(
      [event(), event({ campaign: { utm_source: "instagram" } })],
      NOW,
    );

    expect(summary.topSources).toEqual([
      { count: 1, label: "Direct" },
      { count: 1, label: "instagram" },
    ]);
  });

  it("survives malformed snapshot and campaign payloads", () => {
    const summary = summarizeInquiries(
      [
        event({ campaign: "nope", catalogSnapshot: "nope" }),
        event({ campaign: null, catalogSnapshot: [null, 42, {}] }),
      ],
      NOW,
    );

    expect(summary.total).toBe(2);
    expect(summary.productsAsked).toBe(0);
  });

  it("honours the ranking limit", () => {
    const events = Array.from({ length: 12 }, (_unused, index) =>
      event({ catalogSnapshot: [{ slug: `product-${index}` }] }),
    );

    expect(summarizeInquiries(events, NOW, 3).topProducts).toHaveLength(3);
  });
});
