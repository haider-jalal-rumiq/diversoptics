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
