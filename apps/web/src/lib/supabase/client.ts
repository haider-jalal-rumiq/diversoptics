"use client";

import { createBrowserClient } from "@supabase/ssr";

import { requireSupabasePublicConfig } from "@/lib/supabase/config";
import type { Database } from "@/types/database.types";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null =
  null;

/** Returns one typed browser client per tab instead of recreating auth state. */
export function createClient() {
  if (browserClient) {
    return browserClient;
  }

  const config = requireSupabasePublicConfig();
  browserClient = createBrowserClient<Database>(
    config.url,
    config.publishableKey,
  );

  return browserClient;
}
