import type { DeploymentEnvironment } from "@/lib/config/site";

export type CatalogSource = "supabase" | "fixtures" | "empty";

/**
 * Fictional inventory must never reach the real public destination, so production
 * only ever reads Supabase and falls back to an empty catalog rather than to
 * fixtures when it is not configured. An honest empty storefront is safer than a
 * convincing fake one.
 *
 * `CATALOG_SOURCE` lets a developer pin fixtures while the connected project is
 * still empty, and is deliberately ignored in production so a misconfigured
 * environment variable cannot publish invented products.
 */
export function resolveCatalogSource(
  environment: DeploymentEnvironment,
  supabaseAvailable: boolean,
  requested = process.env.CATALOG_SOURCE,
): CatalogSource {
  if (environment === "production") {
    return supabaseAvailable ? "supabase" : "empty";
  }

  if (requested === "fixtures") return "fixtures";
  if (requested === "supabase") return supabaseAvailable ? "supabase" : "empty";

  return supabaseAvailable ? "supabase" : "fixtures";
}
