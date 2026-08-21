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
import type { CatalogBrand } from "@/features/catalog/domain/types";
import { absoluteUrl } from "@/lib/config/site";

async function loadBrand(slug: string): Promise<CatalogBrand> {
  const brand = await createCatalogRepository().getBrandBySlug(slug);

  if (!brand) notFound();

  return brand;
}

export async function generateMetadata(
  props: PageProps<"/brands/[brand]">,
): Promise<Metadata> {
  const { brand: slug } = await props.params;
  const brand = await loadBrand(slug);

  return {
    alternates: { canonical: brand.href },
    description:
      brand.description ??
      `${brand.name} at Diverso Optics in F-11 Markaz, Islamabad.`,
    title: brand.name,
  };
}

export default async function BrandPage(props: PageProps<"/brands/[brand]">) {
  const [{ brand: slug }, searchParams] = await Promise.all([
    props.params,
    props.searchParams,
  ]);

  const repository = createCatalogRepository();
  const brand = await loadBrand(slug);
  const filters = parseCatalogFilters(searchParams);

  const page = await repository.listProducts({
    brandSlug: brand.slug,
    filters,
  });

  const trail = [
    { href: "/", label: "Home" },
    { href: "/brands", label: "Brands" },
    { href: brand.href, label: brand.name },
  ];

  const breadcrumbSchema = buildBreadcrumbSchema(trail, (path) =>
    absoluteUrl(path),
  );

  return (
    <SiteShell>
      {breadcrumbSchema ? <JsonLd data={breadcrumbSchema} /> : null}
      <CatalogListing
        basePath={brand.href}
        demo={isDemoCatalog()}
        // Only CMS-entered brand copy is shown. AGENTS.md forbids reproducing
        // manufacturer marketing text or inventing a brand summary.
        description={brand.description}
        filters={filters}
        page={page}
        title={brand.name}
        trail={trail}
      />
    </SiteShell>
  );
}
