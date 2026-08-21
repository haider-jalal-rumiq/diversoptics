import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { getSupabasePublicConfig } from "@/lib/supabase/config";
import type { Database } from "@/types/database.types";

export type PublicCatalogClient = ReturnType<
  typeof createSupabaseClient<Database>
>;

/**
 * Public catalog reads deliberately avoid the cookie-bound server client. Reading
 * cookies would opt every listing and product page out of caching, and anonymous
 * catalog data is identical for every visitor, so the anon key is used directly.
 *
 * Returns null when the deployment has no Supabase configuration, which keeps a
 * disconnected preview build compiling and rendering an honest empty catalog.
 */
export function createPublicCatalogClient(): PublicCatalogClient | null {
  const config = getSupabasePublicConfig();

  if (!config) return null;

  return createSupabaseClient<Database>(config.url, config.publishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}
