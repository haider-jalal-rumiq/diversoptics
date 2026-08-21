import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { requireSupabasePublicConfig } from "@/lib/supabase/config";
import type { Database } from "@/types/database.types";

/**
 * Each request receives its own client so authenticated RLS always evaluates
 * against the request's validated access token.
 */
export async function createClient() {
  const config = requireSupabasePublicConfig();
  const cookieStore = await cookies();

  return createServerClient<Database>(config.url, config.publishableKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, options, value }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot write cookies; proxy.ts performs refreshes.
        }
      },
    },
  });
}
