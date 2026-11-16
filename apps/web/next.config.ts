import type { NextConfig } from "next";

import {
  buildSecurityHeaders,
  NO_INDEX_HEADERS,
  SVG_HEADERS,
} from "./src/lib/security/security-headers";

const isDevelopment = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  async headers() {
    return [
      // Every response, including static pages and the files in public/.
      {
        headers: buildSecurityHeaders({
          development: isDevelopment,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        }),
        source: "/:path*",
      },
      // Later rules replace earlier ones for the same header, so these follow the
      // global policy.
      { headers: [...SVG_HEADERS], source: "/:file(.*\\.svg)" },
      { headers: [...NO_INDEX_HEADERS], source: "/cms/:path*" },
      { headers: [...NO_INDEX_HEADERS], source: "/api/cms/:path*" },
    ];
  },
  experimental: {
    serverActions: {
      // CSV imports use Server Actions; product images upload directly to
      // private Supabase Storage so they never cross Vercel's request limit.
      bodySizeLimit: "2mb",
    },
  },
  images: {
    // Vercel's image optimizer answers new images with HTTP 402
    // (OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED) once the team's usage limit is
    // reached, which blanked every product photo added after that point. Every
    // catalog image is already a compressed WebP derivative (<=1800px, ~50 KB)
    // produced at import time, and site images are small WebP files, so they
    // are served as-is and the optimizer is never involved. Remove this to go
    // back to on-demand resizing once the Vercel plan or spend limit allows it.
    unoptimized: true,
    remotePatterns: [
      {
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/catalog-public/**",
        protocol: "https",
      },
    ],
  },
  poweredByHeader: false,
  reactStrictMode: true,
  typedRoutes: true,
};

export default nextConfig;
