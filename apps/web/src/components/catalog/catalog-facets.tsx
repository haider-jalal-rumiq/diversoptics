import type { Route } from "next";
import Link from "next/link";

import {
  hasActiveFilters,
  serializeCatalogFilters,
  toggleAvailabilityFilter,
  toggleBrandFilter,
} from "@/features/catalog/domain/filters";
import { formatAvailabilityLabel } from "@/features/catalog/domain/price";
import type {
  Availability,
  CatalogFacets,
  CatalogFilterState,
} from "@/features/catalog/domain/types";
import { cn } from "@/lib/utils/cn";

type CatalogFacetsProps = {
  basePath: string;
  facets: CatalogFacets;
  filters: CatalogFilterState;
};

function FacetLink({
  active,
  count,
  href,
  label,
}: {
  active: boolean;
  count: number;
  href: string;
  label: string;
}) {
  return (
    <li>
      <Link
        // A link cannot take aria-pressed; aria-current is the valid way for a
        // navigation control to say "this filter is applied".
        aria-current={active ? "true" : undefined}
        className={cn(
          "flex min-h-11 items-center justify-between gap-3 rounded-lg px-3 text-sm transition-colors hover:bg-porcelain",
          active && "bg-orbit-gold font-semibold hover:bg-orbit-gold",
        )}
        href={href as Route}
        // A crawler should not follow every filter permutation.
        rel="nofollow"
      >
        <span>{label}</span>
        <span className="text-xs text-smoke">{count}</span>
      </Link>
    </li>
  );
}

/**
 * Facets are plain links built from the current filter state, so filtering works
 * without JavaScript and every combination has a shareable URL. docs/04 requires
 * keyboard access to the filters, which links give for free.
 */
export function CatalogFacetList({
  basePath,
  facets,
  filters,
}: CatalogFacetsProps) {
  const hasBrandFacets = facets.brands.length > 1;
  const hasAvailabilityFacets = facets.availability.length > 1;

  if (!hasBrandFacets && !hasAvailabilityFacets) {
    // docs/04: do not show a filter until enough products use it consistently.
    return (
      <p className="text-sm text-smoke">
        Filters appear once the catalog holds enough products to compare.
      </p>
    );
  }

  return (
    <div className="space-y-7">
      {hasBrandFacets ? (
        <section aria-labelledby="facet-brand">
          <h3
            className="text-xs font-semibold tracking-[0.08em] text-smoke"
            id="facet-brand"
          >
            BRAND
          </h3>
          <ul className="mt-2 list-none space-y-1 p-0">
            {facets.brands.map((facet) => (
              <FacetLink
                active={filters.brandSlugs.includes(facet.slug)}
                count={facet.count}
                href={`${basePath}${serializeCatalogFilters(
                  toggleBrandFilter(filters, facet.slug),
                )}`}
                key={facet.slug}
                label={facet.label}
              />
            ))}
          </ul>
        </section>
      ) : null}

      {hasAvailabilityFacets ? (
        <section aria-labelledby="facet-availability">
          <h3
            className="text-xs font-semibold tracking-[0.08em] text-smoke"
            id="facet-availability"
          >
            AVAILABILITY
          </h3>
          <ul className="mt-2 list-none space-y-1 p-0">
            {facets.availability.map((facet) => (
              <FacetLink
                active={filters.availability.includes(
                  facet.slug as Availability,
                )}
                count={facet.count}
                href={`${basePath}${serializeCatalogFilters(
                  toggleAvailabilityFilter(filters, facet.slug as Availability),
                )}`}
                key={facet.slug}
                label={formatAvailabilityLabel(facet.slug as Availability)}
              />
            ))}
          </ul>
        </section>
      ) : null}

      {hasActiveFilters(filters) ? (
        <Link
          className="inline-flex min-h-11 items-center text-sm font-semibold underline"
          href={
            `${basePath}${serializeCatalogFilters({
              ...filters,
              availability: [],
              brandSlugs: [],
              page: 1,
            })}` as Route
          }
          rel="nofollow"
        >
          Clear filters
        </Link>
      ) : null}
    </div>
  );
}
