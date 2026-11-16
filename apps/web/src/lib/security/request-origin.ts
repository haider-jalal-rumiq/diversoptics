/**
 * Browsers send `Origin` on cross-origin requests and on same-origin POSTs. A
 * state-changing route accepts a request only when that origin is the one the
 * browser addressed.
 *
 * The address comes from the Host headers rather than `request.url`. The runtime can
 * report a different host than the browser used (for example `localhost` when the
 * server is started with `--hostname 127.0.0.1`), and a proxy rewrites the URL too.
 *
 * A page on another site cannot change Origin, Host or the forwarded headers, so a
 * forged cross-site request never matches.
 */
export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");

  if (!origin) return false;

  const requestUrl = new URL(request.url);
  const host =
    firstListValue(request.headers.get("x-forwarded-host")) ??
    firstListValue(request.headers.get("host")) ??
    requestUrl.host;
  const protocol =
    firstListValue(request.headers.get("x-forwarded-proto")) ??
    requestUrl.protocol.replace(":", "");

  return origin.toLowerCase() === `${protocol}://${host}`.toLowerCase();
}

/**
 * Route handlers parse request bodies as JSON whatever the Content-Type says, so a
 * text/plain form post could smuggle JSON-shaped text into the parser. Requiring
 * the media type keeps those requests out of the parser.
 */
export function isJsonRequest(request: Request): boolean {
  const mediaType =
    request.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() ??
    "";

  return mediaType === "application/json";
}

/** Proxies append to forwarded headers, so only the first entry names the browser's host. */
function firstListValue(value: string | null): string | null {
  const first = value?.split(",")[0]?.trim();

  return first ? first : null;
}
