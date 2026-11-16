/**
 * Response headers for every route. This module has no framework imports, so the
 * policy can be unit-tested and read in one place. next.config.ts applies it.
 *
 * Scripts allow 'unsafe-inline' on purpose. A nonce would force every page to render
 * on each request and end the static caching the catalogue depends on. The other
 * directives still close the usual exfiltration routes: scripts, images and requests
 * can reach only this origin and the project's own Supabase host.
 */

export type SecurityHeader = { key: string; value: string };

export type SecurityHeaderOptions = {
  development: boolean;
  /** `NEXT_PUBLIC_SUPABASE_URL`. The policy names this project only, never every Supabase host. */
  supabaseUrl: string | undefined;
};

const PERMISSIONS_POLICY = [
  "accelerometer=()",
  "bluetooth=()",
  "camera=()",
  "geolocation=()",
  "gyroscope=()",
  "magnetometer=()",
  "microphone=()",
  "payment=()",
  "serial=()",
  "usb=()",
].join(", ");

/** Served with every SVG so a file opened directly cannot run script. */
export const SVG_HEADERS: readonly SecurityHeader[] = [
  {
    key: "Content-Security-Policy",
    value: "default-src 'none'; style-src 'unsafe-inline'; sandbox",
  },
];

/** Keeps staff pages and staff API routes out of search engines. */
export const NO_INDEX_HEADERS: readonly SecurityHeader[] = [
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
];

/** Returns the origin of an http(s) URL, or null when the value is unusable. */
export function supabaseOrigin(url: string | undefined): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);

    return parsed.protocol === "https:" || parsed.protocol === "http:"
      ? parsed.origin
      : null;
  } catch {
    return null;
  }
}

export function buildContentSecurityPolicy({
  development,
  supabaseUrl,
}: SecurityHeaderOptions): string {
  const supabase = supabaseOrigin(supabaseUrl);
  const supabaseSources = supabase ? [supabase] : ["https://*.supabase.co"];

  const directives: ReadonlyArray<readonly [string, readonly string[]]> = [
    ["default-src", ["'self'"]],
    [
      "script-src",
      [
        "'self'",
        "'unsafe-inline'",
        // React uses eval only to rebuild server stack traces in development.
        ...(development ? ["'unsafe-eval'"] : []),
      ],
    ],
    ["style-src", ["'self'", "'unsafe-inline'"]],
    // Blob URLs back the CMS image preview before upload.
    ["img-src", ["'self'", "data:", "blob:", ...supabaseSources]],
    ["font-src", ["'self'", "data:"]],
    [
      "connect-src",
      [
        "'self'",
        ...supabaseSources,
        // Hot module reloading talks over a websocket in development.
        ...(development ? ["ws:", "wss:"] : []),
      ],
    ],
    // The store page embeds one Google Maps view and nothing else.
    ["frame-src", ["https://www.google.com"]],
    ["media-src", ["'self'"]],
    ["object-src", ["'none'"]],
    ["base-uri", ["'self'"]],
    ["form-action", ["'self'"]],
    ["frame-ancestors", ["'none'"]],
  ];

  const serialised = directives.map(([name, sources]) =>
    [name, ...sources].join(" "),
  );

  if (!development) serialised.push("upgrade-insecure-requests");

  return serialised.join("; ");
}

export function buildSecurityHeaders(
  options: SecurityHeaderOptions,
): SecurityHeader[] {
  return [
    {
      key: "Strict-Transport-Security",
      // Vercel redirects HTTP to HTTPS already; this makes browsers skip the
      // redirect on later visits, including the first visit from a bookmark.
      value: "max-age=63072000; includeSubDomains; preload",
    },
    {
      key: "Content-Security-Policy",
      value: buildContentSecurityPolicy(options),
    },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: PERMISSIONS_POLICY },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ];
}
