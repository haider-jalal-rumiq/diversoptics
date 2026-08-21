import type { Metadata } from "next";

import { CatalogListing } from "@/components/catalog/catalog-listing";
import { CatalogSearchForm } from "@/components/catalog/catalog-search-form";
import { SiteShell } from "@/components/site/site-shell";
import {
  createCatalogRepository,
  isDemoCatalog,
} from "@/features/catalog/data/catalog-repository";
import { parseCatalogFilters } from "@/features/catalog/domain/filters";

const BASE_PATH = "/search";

export const metadata: Metadata = {
  alternates: { canonical: BASE_PATH },
  description:
    "Search the Diverso Optics catalog by product name, brand or model number.",
  // A result page has no stable content of its own, so it stays out of any index
  // even after the launch gate opens crawling for the rest of the site.
  robots: { follow: false, index: false },
  title: "Search",
};

export default async function SearchPage(props: PageProps<"/search">) {
  const searchParams = await props.searchParams;
  const filters = parseCatalogFilters(searchParams);

  const page = await createCatalogRepository().listProducts({ filters });

  return (
    <SiteShell>
      <CatalogListing
        basePath={BASE_PATH}
        demo={isDemoCatalog()}
        description={
          filters.query
            ? null
            : "Search by product name, brand or model number. The store can also check items that are not listed online yet."
        }
        filters={filters}
        intro={
          <div className="mt-6">
            <CatalogSearchForm defaultValue={filters.query} />
          </div>
        }
        page={page}
        title={
          filters.query ? `Search: ${filters.query}` : "Search the catalog"
        }
        trail={[
          { href: "/", label: "Home" },
          { href: BASE_PATH, label: "Search" },
        ]}
      />
    </SiteShell>
  );
}
