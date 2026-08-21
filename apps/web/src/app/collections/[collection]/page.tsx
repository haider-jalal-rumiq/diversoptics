import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CatalogListing } from "@/components/catalog/catalog-listing";
import { JsonLd } from "@/components/seo/json-ld";
import { SiteShell } from "@/components/site/site-shell";
import {
  createCatalogRepository,
  isDemoCatalog,
} from "@/features/catalog/data/catalog-repository";
import { parseCatalogFilters } from "@/features/catalog/domain/filters";
import { buildBreadcrumbSchema } from "@/features/catalog/domain/structured-data";
import type { CatalogCollection } from "@/features/catalog/domain/types";
import { absoluteUrl } from "@/lib/config/site";

async function loadCollection(slug: string): Promise<CatalogCollection> {
  const collection = await createCatalogRepository().getCollectionBySlug(slug);

  if (!collection) notFound();

  return collection;
}

export async function generateMetadata(
  props: PageProps<"/collections/[collection]">,
): Promise<Metadata> {
  const { collection: slug } = await props.params;
  const collection = await loadCollection(slug);

  return {
    alternates: { canonical: collection.href },
    description:
      collection.description ??
      `${collection.name} — a curated edit from Diverso Optics, F-11 Markaz, Islamabad.`,
    title: collection.name,
  };
}

export default async function CollectionPage(
  props: PageProps<"/collections/[collection]">,
) {
  const [{ collection: slug }, searchParams] = await Promise.all([
    props.params,
    props.searchParams,
  ]);

  const repository = createCatalogRepository();
  const collection = await loadCollection(slug);
  const filters = parseCatalogFilters(searchParams);

  const page = await repository.listProducts({
    collectionSlug: collection.slug,
    filters,
  });

  const trail = [
    { href: "/", label: "Home" },
    { href: collection.href, label: collection.name },
  ];

  const breadcrumbSchema = buildBreadcrumbSchema(trail, (path) =>
    absoluteUrl(path),
  );

  return (
    <SiteShell>
      {breadcrumbSchema ? <JsonLd data={breadcrumbSchema} /> : null}
      <CatalogListing
        basePath={collection.href}
        demo={isDemoCatalog()}
        description={collection.description}
        filters={filters}
        page={page}
        title={collection.name}
        trail={trail}
      />
    </SiteShell>
  );
}
