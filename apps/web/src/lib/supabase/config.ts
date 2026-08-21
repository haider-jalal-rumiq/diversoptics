import { z } from "zod";

const publicConfigSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(20),
});

export type SupabasePublicConfig = {
  publishableKey: string;
  url: string;
};

/**
 * Configuration is intentionally optional at build time so pull requests can
 * compile before their preview environment is connected to Supabase.
 */
export function getSupabasePublicConfig(): SupabasePublicConfig | null {
  const parsed = publicConfigSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  });

  if (!parsed.success) {
    return null;
  }

  return {
    publishableKey: parsed.data.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    url: parsed.data.NEXT_PUBLIC_SUPABASE_URL,
  };
}

export function requireSupabasePublicConfig(): SupabasePublicConfig {
  const config = getSupabasePublicConfig();

  if (!config) {
    throw new Error(
      "Supabase public configuration is missing or invalid. Check the deployment environment variables.",
    );
  }

  return config;
}
