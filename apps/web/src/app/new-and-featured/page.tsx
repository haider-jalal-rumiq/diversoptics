import type { Metadata } from "next";

import { CatalogListing } from "@/components/catalog/catalog-listing";
import { JsonLd } from "@/components/seo/json-ld";
import { SiteShell } from "@/components/site/site-shell";
import {
  createCatalogRepository,
  isDemoCatalog,
} from "@/features/catalog/data/catalog-repository";
import { parseCatalogFilters } from "@/features/catalog/domain/filters";
import { buildBreadcrumbSchema } from "@/features/catalog/domain/structured-data";
import { absoluteUrl } from "@/lib/config/site";

const BASE_PATH = "/new-and-featured";
const TRAIL = [
  { href: "/", label: "Home" },
  { href: BASE_PATH, label: "New & featured" },
] as const;

export const metadata: Metadata = {
  alternates: { canonical: BASE_PATH },
  description:
    "Products the Diverso Optics team is currently highlighting in F-11 Markaz, Islamabad.",
  title: "New & featured",
};

export default async function NewAndFeaturedPage(
  props: PageProps<"/new-and-featured">,
) {
  const searchParams = await props.searchParams;
  const filters = parseCatalogFilters(searchParams);

  const page = await createCatalogRepository().listProducts({
    // "Featured" is an editorial flag the owner sets in the CMS, not a guess.
    featuredOnly: true,
    filters,
  });

  const breadcrumbSchema = buildBreadcrumbSchema(TRAIL, (path) =>
    absoluteUrl(path),
  );

  return (
    <SiteShell>
      {breadcrumbSchema ? <JsonLd data={breadcrumbSchema} /> : null}
      <CatalogListing
        basePath={BASE_PATH}
        demo={isDemoCatalog()}
        description="Pieces the Diverso team is currently highlighting. Availability and final price are confirmed by the store."
        filters={filters}
        page={page}
        title="New & featured"
        trail={TRAIL}
      />
    </SiteShell>
  );
}
