export type DeploymentEnvironment =
  "development" | "preview" | "production" | "test";

const productionWhatsApp = {
  display: "+92 333 5777710",
  internationalDigits: "923335777710",
} as const;

const testWhatsApp = {
  display: "03438067821",
  internationalDigits: "923438067821",
} as const;

export const siteConfig = {
  name: "Diverso Optics",
  description:
    "A curated catalog of eyewear, watches and writing instruments from Diverso Optics in F-11 Markaz, Islamabad.",
  locationLabel: "F-11 Markaz, Islamabad",
  navigation: [
    { href: "/eyewear/sunglasses", label: "Sunglasses" },
    { href: "/eyewear/optical-frames", label: "Optical Frames" },
    { href: "/writing-instruments", label: "Pens" },
    { href: "/watches", label: "Watches" },
    { href: "/eyewear", label: "Eyewear" },
  ],
  /**
   * Profile URLs are unconfirmed, so each one is an obvious placeholder rather
   * than a guessed handle. `href: null` renders the icon as plain, unlinked
   * text: the row still reads correctly and nothing points at an account that
   * may belong to someone else. Paste the real URLs here and the links wake up.
   */
  social: [
    { href: null, label: "Facebook", name: "facebook" },
    { href: null, label: "Instagram", name: "instagram" },
    { href: null, label: "TikTok", name: "tiktok" },
  ],
  whatsapp: {
    production: productionWhatsApp,
    test: testWhatsApp,
  },
} as const;

export type SocialPlatform = (typeof siteConfig.social)[number]["name"];

export function resolveDeploymentEnvironment(
  vercelEnvironment = process.env.VERCEL_ENV,
  nodeEnvironment = process.env.NODE_ENV,
): DeploymentEnvironment {
  if (vercelEnvironment === "production") return "production";
  if (vercelEnvironment === "preview") return "preview";
  if (nodeEnvironment === "test") return "test";
  return "development";
}

const FALLBACK_SITE_URL = "http://localhost:3000";

/**
 * Canonical URLs, sitemap entries and the WhatsApp product links all need an
 * absolute origin. A missing or malformed value falls back to localhost so a
 * build never fails on it, and only the real deployment publishes real links.
 */
export function getSiteUrl(
  configured = process.env.NEXT_PUBLIC_SITE_URL,
): string {
  if (!configured) return FALLBACK_SITE_URL;

  try {
    const url = new URL(configured);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return FALLBACK_SITE_URL;
    }

    return url.origin;
  } catch {
    return FALLBACK_SITE_URL;
  }
}

export function absoluteUrl(path: string, siteUrl = getSiteUrl()): string {
  return new URL(path.startsWith("/") ? path : `/${path}`, siteUrl).toString();
}

/**
 * Crawlability is a Phase 05 launch gate: real inventory, confirmed policies and
 * verified store facts must land before this site is indexable. Opt-in requires
 * both the production environment and an explicit flag, so a preview deployment
 * can never be indexed by forgetting to unset something.
 */
export function isSearchIndexingEnabled(
  environment = resolveDeploymentEnvironment(),
  flag = process.env.NEXT_PUBLIC_ENABLE_INDEXING,
): boolean {
  return environment === "production" && flag === "true";
}

export function getWhatsAppDestination(
  environment = resolveDeploymentEnvironment(),
) {
  return environment === "production"
    ? siteConfig.whatsapp.production
    : siteConfig.whatsapp.test;
}

export function buildGeneralWhatsAppHref(
  environment = resolveDeploymentEnvironment(),
): string {
  const destination = getWhatsAppDestination(environment);
  const url = new URL(`https://wa.me/${destination.internationalDigits}`);
  url.searchParams.set(
    "text",
    "Hello Diverso Optics — I would like help choosing an item from your catalog.",
  );
  return url.toString();
}
