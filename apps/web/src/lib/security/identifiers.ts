import { createHmac } from "node:crypto";

/**
 * Used only when no server secret is configured. It still separates these hashes
 * by scope, but it is public knowledge, so a configured secret is the real defence.
 */
const FALLBACK_KEY = "diverso-security-identifiers";

/**
 * Rate-limit buckets and security logs need a stable handle for an address or an
 * email without storing the raw value. The key is the server-only secret, so a copy
 * of the database alone cannot be used to reverse these handles.
 */
export function hashIdentifier(scope: string, value: string): string {
  const key = process.env.SUPABASE_SECRET_KEY || FALLBACK_KEY;

  return createHmac("sha256", key)
    .update(`${scope}:${value.trim().toLowerCase()}`)
    .digest("hex");
}

/**
 * Vercel appends the address of the connecting client to `x-forwarded-for`, so the
 * last entry is the one the platform wrote. A client can prepend anything it likes,
 * but it cannot change what the platform appends. `x-real-ip` is a fallback only.
 */
export function readClientAddress(
  headers: Pick<Headers, "get">,
): string | null {
  const lastForwarded = headers
    .get("x-forwarded-for")
    ?.split(",")
    .pop()
    ?.trim();

  if (lastForwarded) return lastForwarded;

  const realIp = headers.get("x-real-ip")?.trim();

  return realIp || null;
}
