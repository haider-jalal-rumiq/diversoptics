import type { Route } from "next";
import Link from "next/link";

import { serializeCatalogFilters } from "@/features/catalog/domain/filters";
import type { CatalogFilterState } from "@/features/catalog/domain/types";
import { cn } from "@/lib/utils/cn";

/**
 * docs/04 rules out an endless feed because it strips access to the footer and
 * navigation, so paging stays explicit with real links a crawler can follow.
 */
export function CatalogPagination({
  basePath,
  filters,
  pageCount,
}: {
  basePath: string;
  filters: CatalogFilterState;
  pageCount: number;
}) {
  if (pageCount <= 1) return null;

  const current = Math.min(filters.page, pageCount);
  const pages = Array.from(
    { length: pageCount },
    (_unused, index) => index + 1,
  );

  function hrefFor(page: number) {
    return `${basePath}${serializeCatalogFilters(filters, { page })}` as Route;
  }

  return (
    <nav aria-label="Catalog pages" className="mt-10">
      <ul className="flex list-none flex-wrap items-center justify-center gap-1 p-0">
        <li>
          {current > 1 ? (
            <Link
              className="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold hover:bg-white"
              href={hrefFor(current - 1)}
              rel="prev"
            >
              Previous
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className="inline-flex min-h-11 items-center px-4 text-sm text-smoke"
            >
              Previous
            </span>
          )}
        </li>

        {pages.map((page) => (
          <li key={page}>
            <Link
              aria-current={page === current ? "page" : undefined}
              aria-label={`Page ${page}`}
              className={cn(
                "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-sm hover:bg-white",
                page === current &&
                  "bg-obsidian font-semibold text-porcelain hover:bg-obsidian",
              )}
              href={hrefFor(page)}
            >
              {page}
            </Link>
          </li>
        ))}

        <li>
          {current < pageCount ? (
            <Link
              className="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold hover:bg-white"
              href={hrefFor(current + 1)}
              rel="next"
            >
              Next
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className="inline-flex min-h-11 items-center px-4 text-sm text-smoke"
            >
              Next
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
