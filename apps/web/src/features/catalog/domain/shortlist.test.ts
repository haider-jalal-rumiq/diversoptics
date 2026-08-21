import { describe, expect, it } from "vitest";

import {
  addToShortlist,
  isShortlisted,
  parseShortlist,
  removeFromShortlist,
  serializeShortlist,
  SHORTLIST_LIMIT,
  toggleShortlist,
} from "./shortlist";

const entry = { slug: "demo-frame-01", variantSku: null };

describe("reading a stored shortlist", () => {
  it("treats unusable storage as an empty shortlist", () => {
    // The value comes from a previous visit and may be stale, hand-edited or
    // written by an older release, so a bad read must not throw.
    expect(parseShortlist(null)).toEqual([]);
    expect(parseShortlist("")).toEqual([]);
    expect(parseShortlist("not json")).toEqual([]);
    expect(parseShortlist('{"slug":"a"}')).toEqual([]);
  });

  it("drops individual bad entries but keeps the good ones", () => {
    const stored = JSON.stringify([
      { slug: "demo-frame-01" },
      { slug: "bad slug" },
      { notASlug: true },
      null,
      { slug: "demo-watch-01", variantSku: "DEMO-WAT-001-BLK" },
    ]);

    expect(parseShortlist(stored)).toEqual([
      { slug: "demo-frame-01", variantSku: null },
      { slug: "demo-watch-01", variantSku: "DEMO-WAT-001-BLK" },
    ]);
  });

  it("removes duplicates and honours the limit", () => {
    const stored = JSON.stringify(
      Array.from({ length: SHORTLIST_LIMIT + 4 }, (_unused, index) => ({
        slug: `demo-product-${index}`,
      })),
    );

    expect(parseShortlist(stored)).toHaveLength(SHORTLIST_LIMIT);
    expect(parseShortlist(JSON.stringify([entry, entry, entry]))).toHaveLength(
      1,
    );
  });

  it("round trips through serialization", () => {
    expect(parseShortlist(serializeShortlist([entry]))).toEqual([entry]);
  });
});

describe("changing a shortlist", () => {
  it("updates the variant instead of duplicating the product", () => {
    const withVariant = addToShortlist([entry], {
      slug: entry.slug,
      variantSku: "DEMO-EYE-001-TRT",
    });

    expect(withVariant).toEqual([
      { slug: entry.slug, variantSku: "DEMO-EYE-001-TRT" },
    ]);
  });

  it("keeps existing contents when full rather than evicting silently", () => {
    const full = Array.from({ length: SHORTLIST_LIMIT }, (_unused, index) => ({
      slug: `demo-product-${index}`,
      variantSku: null,
    }));

    expect(addToShortlist(full, entry)).toEqual(full);
  });

  it("removes and reports membership", () => {
    expect(isShortlisted([entry], entry.slug)).toBe(true);
    expect(removeFromShortlist([entry], entry.slug)).toEqual([]);
    expect(isShortlisted([], entry.slug)).toBe(false);
  });

  it("toggles in both directions", () => {
    const added = toggleShortlist([], entry);

    expect(added).toEqual([entry]);
    expect(toggleShortlist(added, entry)).toEqual([]);
  });

  it("rejects an entry that is not a usable product reference", () => {
    expect(
      addToShortlist([], { slug: "not a slug", variantSku: null }),
    ).toEqual([]);
  });
});
