import { Container } from "@/components/ui/container";
import { countActiveFilters } from "@/features/catalog/domain/filters";
import type {
  CatalogFilterState,
  CatalogPage,
} from "@/features/catalog/domain/types";

import { Breadcrumbs, type BreadcrumbTrail } from "./breadcrumbs";
import { CatalogEmptyState } from "./catalog-empty-state";
import { CatalogFacetList } from "./catalog-facets";
import { CatalogFilterDrawer } from "./catalog-filter-drawer";
import { CatalogPagination } from "./catalog-pagination";
import { CatalogSort } from "./catalog-sort";
import { DemoCatalogNotice } from "./demo-catalog-notice";
import { ProductGrid } from "./product-grid";

type CatalogListingProps = {
  /** Canonical path without a query string; every control appends to it. */
  basePath: string;
  demo: boolean;
  description?: string | null;
  filters: CatalogFilterState;
  intro?: React.ReactNode;
  page: CatalogPage;
  title: string;
  trail: BreadcrumbTrail;
};

/**
 * One listing shell shared by category, brand, collection, search and featured
 * routes, so the filter, sort, count, paging and zero-state behaviour cannot
 * drift between them.
 */
export function CatalogListing({
  basePath,
  demo,
  description,
  filters,
  intro,
  page,
  title,
  trail,
}: CatalogListingProps) {
  const activeCount = countActiveFilters(filters);
  // Offering a price sort over a set with no prices would rank nothing.
  const allowPriceSort = page.products.some(
    (product) => product.price !== null,
  );

  const facets = (
    <CatalogFacetList
      basePath={basePath}
      facets={page.facets}
      filters={filters}
    />
  );

  return (
    <main className="bg-porcelain py-8 sm:py-12" id="main">
      <Container className="sm:max-w-[70rem]">
        <div className="space-y-5">
          <Breadcrumbs trail={trail} />
          <DemoCatalogNotice active={demo} />

          <header>
            <h1 className="font-display text-[2.75rem] leading-[1.05] tracking-[-0.01em] sm:text-5xl">
              {title}
            </h1>
            {description ? (
              <p className="mt-4 max-w-prose text-base leading-7 text-smoke">
                {description}
              </p>
            ) : null}
            {intro}
          </header>
        </div>

        <div className="mt-9 grid gap-8 lg:grid-cols-[16rem_1fr]">
          <aside aria-labelledby="filters-heading" className="hidden lg:block">
            {/*
              The facet groups are h3, so the region needs an h2 above them or the
              document jumps h1 to h3. It is visually hidden because the sidebar
              already reads as filters, but assistive tech needs the level.
            */}
            <h2 className="sr-only" id="filters-heading">
              Filters
            </h2>
            {facets}
          </aside>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-smoke/25 pb-4">
              <p aria-live="polite" className="text-sm text-smoke">
                {page.total === 1 ? "1 product" : `${page.total} products`}
                {activeCount > 0 ? " matching your filters" : ""}
              </p>
              <div className="flex items-center gap-2">
                <CatalogFilterDrawer activeCount={activeCount}>
                  {facets}
                </CatalogFilterDrawer>
                <CatalogSort
                  allowPriceSort={allowPriceSort}
                  basePath={basePath}
                  filters={filters}
                />
              </div>
            </div>

            <h2 className="sr-only">Products</h2>

            <div className="mt-6">
              {page.products.length === 0 ? (
                <CatalogEmptyState basePath={basePath} filters={filters} />
              ) : (
                <ProductGrid products={page.products} />
              )}
            </div>

            <CatalogPagination
              basePath={basePath}
              filters={filters}
              pageCount={page.pageCount}
            />
          </div>
        </div>
      </Container>
    </main>
  );
}
