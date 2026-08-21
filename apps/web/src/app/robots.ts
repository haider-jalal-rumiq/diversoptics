import type { MetadataRoute } from "next";

import { absoluteUrl, isSearchIndexingEnabled } from "@/lib/config/site";

/**
 * Until the Phase 05 launch gate opens indexing, everything is disallowed. The
 * CMS, auth and inquiry paths stay disallowed afterwards: the first two are
 * private, and the third is a redirect that would waste crawl budget and could
 * log crawler-triggered inquiry events.
 */
export default function robots(): MetadataRoute.Robots {
  if (!isSearchIndexingEnabled()) {
    return { rules: { disallow: "/", userAgent: "*" } };
  }

  return {
    rules: {
      allow: "/",
      disallow: [
        "/cms/",
        "/auth/",
        "/api/",
        "/inquiry",
        "/preview/",
        "/search",
      ],
      userAgent: "*",
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
