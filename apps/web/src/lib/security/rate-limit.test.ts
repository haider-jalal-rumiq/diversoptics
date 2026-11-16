import { afterEach, describe, expect, it, vi } from "vitest";

const { rpc, adminConfigured } = vi.hoisted(() => ({
  rpc: vi.fn(),
  adminConfigured: { value: true },
}));

vi.mock("@/lib/supabase/admin", () => ({
  canCreateAdminClient: () => adminConfigured.value,
  createAdminClient: () => ({ rpc }),
}));

import { consumeRateLimit, type RateLimitPolicy } from "./rate-limit";

const policy: RateLimitPolicy = {
  bucket: "login-email:abc",
  limit: 10,
  scope: "login-email",
  windowSeconds: 900,
};

function securityEvents(calls: readonly (readonly unknown[])[]): string[] {
  return calls.map((call) => {
    const entry = JSON.parse(String(call[0])) as { event: string };

    return entry.event;
  });
}

describe("consumeRateLimit", () => {
  afterEach(() => {
    rpc.mockReset();
    adminConfigured.value = true;
    vi.restoreAllMocks();
  });

  it("allows an attempt the counter accepts", async () => {
    rpc.mockResolvedValue({ data: true, error: null });

    await expect(consumeRateLimit(policy)).resolves.toBe(true);
    expect(rpc).toHaveBeenCalledWith("consume_rate_limit", {
      p_bucket: "login-email:abc",
      p_limit: 10,
      p_window_seconds: 900,
    });
  });

  it("blocks and logs an attempt over the limit", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    rpc.mockResolvedValue({ data: false, error: null });

    await expect(consumeRateLimit(policy)).resolves.toBe(false);
    expect(securityEvents(warn.mock.calls)).toEqual(["rate_limit.exceeded"]);
  });

  it("logs the block without the raw bucket value", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    rpc.mockResolvedValue({ data: false, error: null });

    await consumeRateLimit(policy);

    expect(String(warn.mock.calls[0]?.[0])).not.toContain("login-email:abc");
  });

  it("fails open and logs when the counter returns an error", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    rpc.mockResolvedValue({ data: null, error: { message: "boom" } });

    await expect(consumeRateLimit(policy)).resolves.toBe(true);
    expect(securityEvents(warn.mock.calls)).toEqual(["rate_limit.unavailable"]);
  });

  it("skips the counter and fails open when the admin client is not configured", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    adminConfigured.value = false;

    await expect(consumeRateLimit(policy)).resolves.toBe(true);
    expect(rpc).not.toHaveBeenCalled();
    expect(securityEvents(warn.mock.calls)).toEqual(["rate_limit.unavailable"]);
  });
});
