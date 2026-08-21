import type { CatalogCategoryNode } from "./types";

export type CategoryInput = {
  demo: boolean;
  description: string | null;
  eyebrow: string | null;
  id: string;
  name: string;
  parentId: string | null;
  slug: string;
};

/** Guards against a self-referencing or cyclic parent chain. */
const MAX_DEPTH = 8;

type MutableNode = Omit<CatalogCategoryNode, "children"> & {
  children: MutableNode[];
};

/**
 * The approved sitemap places categories at the site root, so a category path is
 * the chain of slugs from its top-level ancestor down: `/eyewear/sunglasses`.
 *
 * A row whose ancestry is broken or cyclic is dropped rather than rehomed at the
 * root, which would publish a URL the navigation never links to.
 */
export function buildCategoryTree(
  rows: readonly CategoryInput[],
): readonly CatalogCategoryNode[] {
  const byId = new Map(rows.map((row) => [row.id, row]));

  function pathFor(row: CategoryInput): string | null {
    const segments: string[] = [];
    let current: CategoryInput | undefined = row;

    for (let depth = 0; current && depth <= MAX_DEPTH; depth += 1) {
      segments.unshift(current.slug);

      if (current.parentId === null) return `/${segments.join("/")}`;

      current = byId.get(current.parentId);
    }

    return null;
  }

  const nodes = new Map<string, MutableNode>();

  for (const row of rows) {
    const href = pathFor(row);

    if (!href) continue;

    nodes.set(row.id, {
      children: [],
      demo: row.demo,
      description: row.description ?? "",
      eyebrow: row.eyebrow ?? "",
      href,
      id: row.id,
      name: row.name,
      parentId: row.parentId,
      slug: row.slug,
    });
  }

  const roots: MutableNode[] = [];

  for (const row of rows) {
    const node = nodes.get(row.id);

    if (!node) continue;

    if (row.parentId === null) {
      roots.push(node);
      continue;
    }

    nodes.get(row.parentId)?.children.push(node);
  }

  return roots;
}

export function flattenCategories(
  nodes: readonly CatalogCategoryNode[],
): readonly CatalogCategoryNode[] {
  return nodes.flatMap((node) => [node, ...flattenCategories(node.children)]);
}

export function findCategoryByPath(
  nodes: readonly CatalogCategoryNode[],
  segments: readonly string[],
): CatalogCategoryNode | null {
  if (segments.length === 0) return null;

  const path = `/${segments.join("/")}`;

  return flattenCategories(nodes).find((node) => node.href === path) ?? null;
}

/**
 * A category listing includes its descendants, so browsing `/eyewear` shows
 * sunglasses and optical frames rather than only rows filed directly on the
 * parent.
 */
export function collectCategoryIds(
  node: CatalogCategoryNode,
): readonly string[] {
  return [node.id, ...node.children.flatMap(collectCategoryIds)];
}

export function findCategoryById(
  nodes: readonly CatalogCategoryNode[],
  id: string,
): CatalogCategoryNode | null {
  return flattenCategories(nodes).find((node) => node.id === id) ?? null;
}
