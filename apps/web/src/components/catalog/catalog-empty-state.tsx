import type { Route } from "next";
import Link from "next/link";

import { hasActiveFilters } from "@/features/catalog/domain/filters";
import type { CatalogFilterState } from "@/features/catalog/domain/types";

/**
 * docs/04 asks for a helpful zero state rather than a bare "no results". The
 * wording distinguishes a filter that excluded everything from a section the
 * business has not published yet, because the useful next step differs.
 */
export function CatalogEmptyState({
  basePath,
  filters,
}: {
  basePath: string;
  filters: CatalogFilterState;
}) {
  const filtered = hasActiveFilters(filters);

  return (
    <div className="rounded-xl border border-smoke/30 bg-white p-6">
      <h2 className="font-display text-3xl leading-tight">
        {filtered
          ? "Nothing matches those filters."
          : "Nothing published here yet."}
      </h2>
      <p className="mt-3 max-w-prose text-sm leading-6 text-smoke">
        {filtered
          ? "Try removing a filter, or ask the Diverso team directly — the store often has options that are not listed online yet."
          : "This section is part of the catalog but has no published products at the moment. The Diverso team can tell you what is currently in store."}
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        {filtered ? (
          <Link
            className="inline-flex min-h-11 items-center rounded-full border border-obsidian px-5 text-sm font-semibold"
            href={basePath as Route}
          >
            Clear all filters
          </Link>
        ) : null}
        <Link
          className="inline-flex min-h-11 items-center rounded-full border border-obsidian px-5 text-sm font-semibold"
          href="/store"
        >
          Visit the F-11 store page
        </Link>
      </div>
    </div>
  );
}
