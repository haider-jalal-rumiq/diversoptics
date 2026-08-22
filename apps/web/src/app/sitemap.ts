import type { MetadataRoute } from "next";

import { createCatalogRepository } from "@/features/catalog/data/catalog-repository";
import { flattenCategories } from "@/features/catalog/domain/categories";
import { absoluteUrl } from "@/lib/config/site";

const STATIC_PATHS = [
  { changeFrequency: "weekly", path: "/", priority: 1 },
  { changeFrequency: "weekly", path: "/new-and-featured", priority: 0.8 },
  { changeFrequency: "monthly", path: "/brands", priority: 0.6 },
  { changeFrequency: "monthly", path: "/guides", priority: 0.5 },
  { changeFrequency: "monthly", path: "/store", priority: 0.7 },
] as const;

/** Regenerated periodically so newly published products enter the sitemap. */
export const revalidate = 3600;

/**
 * Lists only pages a visitor can reach and a crawler should see. `/search`,
 * `/shortlist`, `/inquiry` and every filter permutation are excluded: they carry
 * no stable content of their own.
 *
 * Nothing here is gated on the launch flag — robots.txt controls crawling, and
 * keeping the sitemap accurate means Phase 05 only has to flip that one switch.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const repository = createCatalogRepository();

  const [tree, brands, collections, guides, policies, productSlugs] =
    await Promise.all([
      repository.getCategoryTree(),
      repository.getBrands(),
      repository.getCollections(),
      repository.getPages("guide"),
      repository.getPages("policy"),
      repository.getAllProductSlugs(),
    ]);

  return [
    ...STATIC_PATHS.map((entry) => ({
      changeFrequency: entry.changeFrequency,
      priority: entry.priority,
      url: absoluteUrl(entry.path),
    })),
    ...flattenCategories(tree).map((category) => ({
      changeFrequency: "weekly" as const,
      priority: 0.8,
      url: absoluteUrl(category.href),
    })),
    ...collections.map((collection) => ({
      changeFrequency: "weekly" as const,
      priority: 0.6,
      url: absoluteUrl(collection.href),
    })),
    ...brands.map((brand) => ({
      changeFrequency: "monthly" as const,
      priority: 0.6,
      url: absoluteUrl(brand.href),
    })),
    ...productSlugs.map((slug) => ({
      changeFrequency: "weekly" as const,
      priority: 0.9,
      url: absoluteUrl(`/products/${slug}`),
    })),
    ...[...guides, ...policies].map((page) => ({
      changeFrequency: "monthly" as const,
      priority: 0.4,
      url: absoluteUrl(page.href),
    })),
  ];
}
