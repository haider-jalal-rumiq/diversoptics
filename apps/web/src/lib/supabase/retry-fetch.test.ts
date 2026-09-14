import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchWithRetry } from "./retry-fetch";

const url = "https://example.supabase.co/rest/v1/brands";

/** Each argument is one attempt's outcome; the last one repeats thereafter. */
function stubFetch(...outcomes: readonly (number | Error)[]) {
  let attempt = 0;

  const fetchMock = vi.fn(async () => {
    const outcome = outcomes[Math.min(attempt, outcomes.length - 1)] ?? 200;

    attempt += 1;

    if (outcome instanceof Error) throw outcome;

    return new Response("[]", { status: outcome });
  });

  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("fetchWithRetry", () => {
  it("retries a gateway timeout and returns the eventual success", async () => {
    const fetchMock = stubFetch(504, 504, 200);

    const response = await fetchWithRetry(url);

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("retries a lost connection", async () => {
    const fetchMock = stubFetch(new Error("fetch failed"), 200);

    await expect(fetchWithRetry(url)).resolves.toMatchObject({ status: 200 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("hands back the failure once the retries are spent", async () => {
    // A real outage must still fail loudly rather than resolve into silence.
    const fetchMock = stubFetch(503);

    const response = await fetchWithRetry(url);

    expect(response.status).toBe(503);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("does not retry a data error, which is an answer rather than a blip", async () => {
    const fetchMock = stubFetch(404);

    const response = await fetchWithRetry(url);

    expect(response.status).toBe(404);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("never replays a write", async () => {
    const fetchMock = stubFetch(504, 200);

    const response = await fetchWithRetry(url, { method: "POST" });

    expect(response.status).toBe(504);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
