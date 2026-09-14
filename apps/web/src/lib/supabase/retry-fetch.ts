import { setTimeout as sleep } from "node:timers/promises";

/** Transport-level failures only. A 4xx is an answer, not a lost request. */
const TRANSIENT_STATUSES = new Set([408, 429, 500, 502, 503, 504]);
const RETRY_DELAYS_MS = [250, 750];

/**
 * Catalog reads throw on any error by design, and a build prerenders every
 * listing page, so one stray gateway timeout from Supabase fails the whole
 * deployment — which it did twice in one day, on `/brands` and `/sitemap.xml`.
 *
 * Retrying keeps that contract intact: a real data error still surfaces on the
 * first response, and the last attempt's outcome is returned exactly as it
 * arrives, so a genuine outage still fails the build loudly.
 */
export async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  // Replaying a write could duplicate it; only reads are safe to send twice.
  const method = (init?.method ?? "GET").toUpperCase();

  if (method !== "GET" && method !== "HEAD") return fetch(input, init);

  for (const delay of RETRY_DELAYS_MS) {
    try {
      const response = await fetch(input, init);

      if (!TRANSIENT_STATUSES.has(response.status)) return response;

      // Release the socket before retrying rather than leaving it dangling.
      await response.body?.cancel().catch(() => {});
    } catch {
      // A rejected fetch is a lost connection, which is worth another attempt.
    }

    await sleep(delay);
  }

  return fetch(input, init);
}
