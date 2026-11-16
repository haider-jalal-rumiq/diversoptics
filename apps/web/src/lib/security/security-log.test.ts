import { afterEach, describe, expect, it, vi } from "vitest";

import { logSecurityEvent } from "./security-log";

describe("logSecurityEvent", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("writes one JSON line with the event name and security source", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    logSecurityEvent("csrf.origin_rejected", { route: "upload-token" });

    expect(warn).toHaveBeenCalledTimes(1);
    const entry = JSON.parse(String(warn.mock.calls[0]?.[0])) as Record<
      string,
      unknown
    >;

    expect(entry).toMatchObject({
      event: "csrf.origin_rejected",
      level: "warn",
      route: "upload-token",
      source: "security",
    });
    expect(typeof entry.timestamp).toBe("string");
  });

  it("cannot let caller fields overwrite the event name", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    logSecurityEvent("rate_limit.exceeded", { event: "spoofed" });

    const entry = JSON.parse(String(warn.mock.calls[0]?.[0])) as {
      event: string;
    };

    expect(entry.event).toBe("rate_limit.exceeded");
  });
});
