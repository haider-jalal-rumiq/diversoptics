import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        headers: [
          {
            key: "Strict-Transport-Security",
            // Vercel already redirects HTTP to HTTPS; this tells browsers to
            // skip that redirect and go straight to HTTPS on every future
            // visit, including the first navigation from a bookmark or link.
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
        source: "/:path*",
      },
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
