import { afterEach, describe, expect, it, vi } from "vitest";

import { sessionCookieOptions } from "./cookie-options";

describe("sessionCookieOptions", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("marks cookies Secure in production and keeps SameSite=Lax", () => {
    vi.stubEnv("NODE_ENV", "production");

    expect(
      sessionCookieOptions({ maxAge: 3600, path: "/", sameSite: "none" }),
    ).toEqual({ maxAge: 3600, path: "/", sameSite: "lax", secure: true });
  });

  it("leaves Secure off in development so local HTTP sessions still work", () => {
    vi.stubEnv("NODE_ENV", "development");

    expect(sessionCookieOptions({ path: "/" })).toEqual({
      path: "/",
      sameSite: "lax",
      secure: false,
    });
  });
});
