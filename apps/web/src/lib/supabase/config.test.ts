import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getSupabasePublicConfig,
  requireSupabasePublicConfig,
} from "@/lib/supabase/config";

describe("Supabase public configuration", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns null when a preview has not been connected", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");

    expect(getSupabasePublicConfig()).toBeNull();
  });

  it("maps valid public configuration", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      "sb_publishable_this-is-a-test-key",
    );

    expect(getSupabasePublicConfig()).toEqual({
      publishableKey: "sb_publishable_this-is-a-test-key",
      url: "https://example.supabase.co",
    });
  });

  it("throws a deployment-safe error when required configuration is absent", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");

    expect(() => requireSupabasePublicConfig()).toThrow(
      "Supabase public configuration is missing or invalid",
    );
  });
});
