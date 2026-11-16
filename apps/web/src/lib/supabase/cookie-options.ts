import type { CookieOptions } from "@supabase/ssr";

/**
 * `@supabase/ssr` writes session cookies without `Secure`. Production is served over
 * HTTPS only, so setting the flag there stops the session cookie travelling over
 * plain HTTP. `SameSite=Lax` keeps the cookie off cross-site POST requests, which
 * covers the usual CSRF paths. `HttpOnly` stays as the library sets it, because the
 * media upload form uses the browser client and that client reads this cookie.
 */
export function sessionCookieOptions(options: CookieOptions): CookieOptions {
  return {
    ...options,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  };
}
