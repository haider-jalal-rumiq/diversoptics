import { logSecurityEvent } from "@/lib/security/security-log";
import { canCreateAdminClient, createAdminClient } from "@/lib/supabase/admin";

export type RateLimitPolicy = {
  /** Feature name written to the security log, e.g. `login-email`. Never a raw identifier. */
  scope: string;
  /** Hashed identity namespaced by feature, e.g. `login-email:<hash>`. */
  bucket: string;
  limit: number;
  windowSeconds: number;
};

/**
 * Counts attempts in fixed windows inside Postgres (`public.consume_rate_limit`).
 * Serverless instances do not share memory, so an in-process counter would limit
 * only one instance at a time. The database is the shared state every instance sees.
 *
 * Fails open. When the counter cannot answer, the request proceeds and the outage
 * is logged. Blocking every sign-in or inquiry because a counter is down would turn
 * a rate limit into an outage.
 *
 * Returns true when the attempt is allowed.
 */
export async function consumeRateLimit(
  policy: RateLimitPolicy,
): Promise<boolean> {
  if (!canCreateAdminClient()) {
    logSecurityEvent("rate_limit.unavailable", {
      reason: "admin_not_configured",
      scope: policy.scope,
    });

    return true;
  }

  const { data, error } = await createAdminClient().rpc("consume_rate_limit", {
    p_bucket: policy.bucket,
    p_limit: policy.limit,
    p_window_seconds: policy.windowSeconds,
  });

  if (error) {
    logSecurityEvent("rate_limit.unavailable", {
      reason: "rpc_failed",
      scope: policy.scope,
    });

    return true;
  }

  if (data !== false) return true;

  logSecurityEvent("rate_limit.exceeded", {
    limit: policy.limit,
    scope: policy.scope,
    windowSeconds: policy.windowSeconds,
  });

  return false;
}
