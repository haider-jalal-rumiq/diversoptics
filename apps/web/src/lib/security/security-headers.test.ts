import { describe, expect, it } from "vitest";

import {
  buildContentSecurityPolicy,
  buildSecurityHeaders,
  supabaseOrigin,
} from "./security-headers";

const PROJECT = "https://abcdefgh.supabase.co";

function directive(policy: string, name: string): string[] {
  const match = policy
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name} `) || part === name);

  return match ? match.split(/\s+/).slice(1) : [];
}

describe("buildContentSecurityPolicy", () => {
  it("names the configured Supabase project instead of every Supabase host", () => {
    const policy = buildContentSecurityPolicy({
      development: false,
      supabaseUrl: PROJECT,
    });

    expect(directive(policy, "connect-src")).toContain(PROJECT);
    expect(directive(policy, "img-src")).toContain(PROJECT);
    expect(policy).not.toContain("*.supabase.co");
  });

  it("falls back to the Supabase wildcard only when no project URL is set", () => {
    const policy = buildContentSecurityPolicy({
      development: false,
      supabaseUrl: undefined,
    });

    expect(directive(policy, "connect-src")).toContain("https://*.supabase.co");
  });

  it("blocks plugins, base-tag injection, framing and foreign form targets", () => {
    const policy = buildContentSecurityPolicy({
      development: false,
      supabaseUrl: PROJECT,
    });

    expect(directive(policy, "object-src")).toEqual(["'none'"]);
    expect(directive(policy, "base-uri")).toEqual(["'self'"]);
    expect(directive(policy, "frame-ancestors")).toEqual(["'none'"]);
    expect(directive(policy, "form-action")).toEqual(["'self'"]);
    expect(policy).toContain("upgrade-insecure-requests");
  });

  it("never allows eval or websockets in production", () => {
    const policy = buildContentSecurityPolicy({
      development: false,
      supabaseUrl: PROJECT,
    });

    expect(policy).not.toContain("'unsafe-eval'");
    expect(directive(policy, "connect-src")).not.toContain("ws:");
  });

  it("adds the development-only allowances without loosening production", () => {
    const policy = buildContentSecurityPolicy({
      development: true,
      supabaseUrl: PROJECT,
    });

    expect(directive(policy, "script-src")).toContain("'unsafe-eval'");
    expect(directive(policy, "connect-src")).toContain("ws:");
    expect(policy).not.toContain("upgrade-insecure-requests");
  });
});

describe("buildSecurityHeaders", () => {
  it("sends the full baseline with HSTS, nosniff and anti-framing", () => {
    const headers = new Map(
      buildSecurityHeaders({ development: false, supabaseUrl: PROJECT }).map(
        ({ key, value }) => [key, value],
      ),
    );

    expect(headers.get("Strict-Transport-Security")).toBe(
      "max-age=63072000; includeSubDomains; preload",
    );
    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headers.get("X-Frame-Options")).toBe("DENY");
    expect(headers.get("Referrer-Policy")).toBe(
      "strict-origin-when-cross-origin",
    );
    expect(headers.get("Cross-Origin-Opener-Policy")).toBe("same-origin");
    expect(headers.get("Permissions-Policy")).toContain("camera=()");
    expect(headers.get("Content-Security-Policy")).toContain(
      "frame-ancestors 'none'",
    );
  });
});

describe("supabaseOrigin", () => {
  it("keeps only the origin and rejects non-web schemes", () => {
    expect(supabaseOrigin("https://abcdefgh.supabase.co/rest/v1/")).toBe(
      PROJECT,
    );
    expect(supabaseOrigin("javascript:alert(1)")).toBeNull();
    expect(supabaseOrigin("not a url")).toBeNull();
    expect(supabaseOrigin(undefined)).toBeNull();
  });
});
