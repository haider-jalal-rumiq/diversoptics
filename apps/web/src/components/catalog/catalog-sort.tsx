import type { Route } from "next";
import Link from "next/link";

import {
  CATALOG_SORTS,
  serializeCatalogFilters,
  SORT_LABELS,
} from "@/features/catalog/domain/filters";
import type {
  CatalogFilterState,
  CatalogSort,
} from "@/features/catalog/domain/types";
import { cn } from "@/lib/utils/cn";

/**
 * docs/04 only offers price sorting when price data is complete enough to rank,
 * so the price options are hidden until at least one product carries a price.
 */
export function CatalogSort({
  allowPriceSort,
  basePath,
  filters,
}: {
  allowPriceSort: boolean;
  basePath: string;
  filters: CatalogFilterState;
}) {
  const options: readonly CatalogSort[] = allowPriceSort
    ? CATALOG_SORTS
    : CATALOG_SORTS.filter((sort) => !sort.startsWith("price_"));

  if (options.length < 2) return null;

  return (
    <nav aria-label="Sort products">
      <ul className="flex list-none flex-wrap items-center gap-1 p-0">
        {options.map((sort) => {
          const active = filters.sort === sort;

          return (
            <li key={sort}>
              <Link
                aria-current={active ? "true" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center rounded-full px-4 text-sm transition-colors hover:bg-porcelain",
                  active &&
                    "bg-obsidian font-semibold text-porcelain hover:bg-obsidian",
                )}
                href={
                  `${basePath}${serializeCatalogFilters(filters, {
                    page: 1,
                    sort,
                  })}` as Route
                }
                rel="nofollow"
              >
                {SORT_LABELS[sort]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
