import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import { requireSupabasePublicConfig } from "@/lib/supabase/config";
import type { Database } from "@/types/database.types";

const secretSchema = z.string().min(20);

export function hasSupabaseSecretKey() {
  return secretSchema.safeParse(process.env.SUPABASE_SECRET_KEY).success;
}

/** This client bypasses RLS and must remain limited to narrow owner actions. */
export function createAdminClient() {
  const secret = secretSchema.parse(process.env.SUPABASE_SECRET_KEY);
  const config = requireSupabasePublicConfig();
  return createSupabaseClient<Database>(config.url, secret, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}
