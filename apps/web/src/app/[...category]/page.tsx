import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CatalogListing } from "@/components/catalog/catalog-listing";
import { JsonLd } from "@/components/seo/json-ld";
import { SiteShell } from "@/components/site/site-shell";
import {
  createCatalogRepository,
  isDemoCatalog,
} from "@/features/catalog/data/catalog-repository";
import {
  collectCategoryIds,
  findCategoryByHref,
} from "@/features/catalog/domain/categories";
import { parseCatalogFilters } from "@/features/catalog/domain/filters";
import { buildBreadcrumbSchema } from "@/features/catalog/domain/structured-data";
import type { CatalogCategoryNode } from "@/features/catalog/domain/types";
import { absoluteUrl } from "@/lib/config/site";

/**
 * The approved sitemap places categories at the site root (`/eyewear`,
 * `/eyewear/sunglasses`), so this catch-all resolves any unmatched path against
 * the published category tree. Static routes such as `/brands` and `/store` take
 * precedence in the App Router, and anything that is not a category 404s.
 */
async function resolveCategory(
  segments: readonly string[],
): Promise<CatalogCategoryNode> {
  const node = await createCatalogRepository().getCategoryByPath(segments);

  if (!node) notFound();

  return node;
}

function trailFor(
  node: CatalogCategoryNode,
  tree: readonly CatalogCategoryNode[],
) {
  // Walk up by trimming path segments, which avoids a second lookup per level.
  const segments = node.href.split("/").filter(Boolean);
  const ancestors = segments.slice(0, -1).map((_unused, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    const match = findCategoryByHref(tree, href);

    return { href, label: match?.name ?? segments[index] ?? href };
  });

  return [
    { href: "/", label: "Home" },
    ...ancestors,
    { href: node.href, label: node.name },
  ];
}

export async function generateMetadata(
  props: PageProps<"/[...category]">,
): Promise<Metadata> {
  const { category } = await props.params;
  const node = await resolveCategory(category);

  return {
    alternates: {
      // Filter and page permutations all point back at the clean category URL.
      canonical: node.href,
    },
    description:
      node.description ||
      `${node.name} at Diverso Optics in F-11 Markaz, Islamabad.`,
    title: node.name,
  };
}

export default async function CategoryPage(props: PageProps<"/[...category]">) {
  const [{ category }, searchParams] = await Promise.all([
    props.params,
    props.searchParams,
  ]);

  const repository = createCatalogRepository();
  const node = await resolveCategory(category);
  const filters = parseCatalogFilters(searchParams);

  const [page, tree] = await Promise.all([
    repository.listProducts({
      categoryIds: collectCategoryIds(node),
      filters,
    }),
    repository.getCategoryTree(),
  ]);

  const trail = trailFor(node, tree);
  const breadcrumbSchema = buildBreadcrumbSchema(trail, (path) =>
    absoluteUrl(path),
  );

  return (
    <SiteShell>
      {breadcrumbSchema ? <JsonLd data={breadcrumbSchema} /> : null}
      <CatalogListing
        basePath={node.href}
        demo={isDemoCatalog()}
        description={node.description || null}
        filters={filters}
        page={page}
        title={node.name}
        trail={trail}
      />
    </SiteShell>
  );
}
