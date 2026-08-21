import type { Metadata } from "next";

import { HomePage } from "@/components/home/home-page";
import { JsonLd } from "@/components/seo/json-ld";
import { SiteShell } from "@/components/site/site-shell";
import {
  createCatalogRepository,
  isDemoCatalog,
} from "@/features/catalog/data/catalog-repository";
import { getStoreSettings } from "@/features/catalog/data/store-settings";
import { buildLocalBusinessSchema } from "@/features/catalog/domain/structured-data";
import { getSiteUrl } from "@/lib/config/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function Page() {
  const repository = createCatalogRepository();

  const [brands, tree, products, settings] = await Promise.all([
    repository.getFeaturedBrands(),
    repository.getCategoryTree(),
    repository.getFeaturedProducts(),
    getStoreSettings(),
  ]);

  return (
    <SiteShell>
      {settings ? (
        <JsonLd
          data={buildLocalBusinessSchema({ settings, siteUrl: getSiteUrl() })}
        />
      ) : null}
      <HomePage
        brands={brands}
        // Only top-level categories act as the home page's entry points.
        categories={tree}
        demo={isDemoCatalog()}
        products={products}
      />
    </SiteShell>
  );
}
