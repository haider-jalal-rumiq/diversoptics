import { describe, expect, it } from "vitest";

import { hashIdentifier, readClientAddress } from "./identifiers";

describe("hashIdentifier", () => {
  it("is stable for the same scope and value, ignoring case and spacing", () => {
    expect(hashIdentifier("login", "Owner@Example.com ")).toBe(
      hashIdentifier("login", "owner@example.com"),
    );
  });

  it("separates scopes so one feature cannot collide with another", () => {
    expect(hashIdentifier("login", "203.0.113.7")).not.toBe(
      hashIdentifier("inquiry", "203.0.113.7"),
    );
  });

  it("never returns the raw value", () => {
    const hash = hashIdentifier("login", "owner@example.com");

    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hash).not.toContain("owner");
  });
});

describe("readClientAddress", () => {
  it("takes the last forwarded entry, which the platform appended", () => {
    const headers = new Headers({
      "x-forwarded-for": "198.51.100.99, 203.0.113.7",
    });

    expect(readClientAddress(headers)).toBe("203.0.113.7");
  });

  it("falls back to x-real-ip when there is no forwarded chain", () => {
    expect(readClientAddress(new Headers({ "x-real-ip": "203.0.113.8" }))).toBe(
      "203.0.113.8",
    );
  });

  it("returns null when no address header is present", () => {
    expect(readClientAddress(new Headers())).toBeNull();
  });
});
