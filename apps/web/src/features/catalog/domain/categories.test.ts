import { describe, expect, it } from "vitest";

import {
  buildCategoryTree,
  collectCategoryIds,
  findCategoryByPath,
  flattenCategories,
  type CategoryInput,
} from "./categories";

function category(
  id: string,
  slug: string,
  parentId: string | null = null,
): CategoryInput {
  return {
    demo: true,
    description: null,
    eyebrow: null,
    id,
    name: slug,
    parentId,
    slug,
  };
}

describe("category tree", () => {
  const rows = [
    category("1", "eyewear"),
    category("2", "sunglasses", "1"),
    category("3", "optical-frames", "1"),
    category("4", "watches"),
  ];

  it("builds root level paths from the slug chain", () => {
    const tree = buildCategoryTree(rows);

    expect(tree.map((node) => node.href)).toEqual(["/eyewear", "/watches"]);
    expect(tree[0]?.children.map((node) => node.href)).toEqual([
      "/eyewear/sunglasses",
      "/eyewear/optical-frames",
    ]);
  });

  it("resolves a nested path", () => {
    const tree = buildCategoryTree(rows);

    expect(findCategoryByPath(tree, ["eyewear", "sunglasses"])?.id).toBe("2");
    expect(findCategoryByPath(tree, ["eyewear"])?.id).toBe("1");
    expect(findCategoryByPath(tree, ["nope"])).toBeNull();
    expect(findCategoryByPath(tree, [])).toBeNull();
  });

  it("includes descendants so browsing a parent shows its children's products", () => {
    const tree = buildCategoryTree(rows);
    const eyewear = findCategoryByPath(tree, ["eyewear"]);

    expect(eyewear && collectCategoryIds(eyewear)).toEqual(["1", "2", "3"]);
  });

  it("drops a row whose parent is missing rather than rehoming it at the root", () => {
    // An orphan promoted to the root would publish a URL the navigation never
    // links to, so it is excluded from the tree entirely.
    const tree = buildCategoryTree([
      category("1", "eyewear"),
      category("9", "orphan", "does-not-exist"),
    ]);

    expect(flattenCategories(tree).map((node) => node.slug)).toEqual([
      "eyewear",
    ]);
  });

  it("survives a cyclic parent chain", () => {
    const tree = buildCategoryTree([
      category("1", "a", "2"),
      category("2", "b", "1"),
    ]);

    expect(tree).toEqual([]);
  });
});
