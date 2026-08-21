import { resolveDeploymentEnvironment } from "@/lib/config/site";

import {
  resolveCatalogSource,
  type CatalogSource,
} from "../domain/catalog-source";
import type { CatalogRepository } from "../domain/types";
import {
  createFixtureCatalogRepository,
  emptyCatalogRepository,
} from "./fixture-catalog";
import { tryCreateSupabaseCatalogRepository } from "./supabase-catalog";

function resolveActiveSource(): {
  source: CatalogSource;
  supabase: CatalogRepository | null;
} {
  const supabase = tryCreateSupabaseCatalogRepository();

  return {
    source: resolveCatalogSource(
      resolveDeploymentEnvironment(),
      supabase !== null,
    ),
    supabase,
  };
}

export function createCatalogRepository(): CatalogRepository {
  const { source, supabase } = resolveActiveSource();

  switch (source) {
    case "supabase":
      // supabase is non-null whenever the policy resolves to this source.
      return supabase ?? emptyCatalogRepository;
    case "fixtures":
      return createFixtureCatalogRepository();
    default:
      return emptyCatalogRepository;
  }
}

/**
 * True when the active catalog is fictional. Public pages read this to render the
 * fixture disclosure AGENTS.md requires for unconfirmed content, so a preview can
 * never be mistaken for real inventory.
 */
export function isDemoCatalog(): boolean {
  return resolveActiveSource().source === "fixtures";
}

export { createFixtureCatalogRepository, emptyCatalogRepository };
