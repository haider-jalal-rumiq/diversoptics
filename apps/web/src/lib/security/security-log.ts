/**
 * Structured records for rejected or suspicious requests. Each entry is one JSON
 * object with an `event` field, so a log drain or search can filter on it.
 *
 * Callers pass identifiers only in hashed form (see `identifiers.ts`). Never pass
 * email addresses, tokens, cookies or raw IP addresses here.
 */

export type SecurityEventName =
  | "auth.sign_in_failed"
  | "cms.authorization_denied"
  | "cms.unauthenticated_mutation"
  | "csrf.origin_rejected"
  | "rate_limit.exceeded"
  | "rate_limit.unavailable"
  | "upload.rejected";

export type SecurityLogValue = string | number | boolean | null;

export function logSecurityEvent(
  event: SecurityEventName,
  fields: Readonly<Record<string, SecurityLogValue>> = {},
): void {
  // Spread first so a caller can never overwrite the event name or level.
  console.warn(
    JSON.stringify({
      ...fields,
      event,
      level: "warn",
      source: "security",
      timestamp: new Date().toISOString(),
    }),
  );
}
