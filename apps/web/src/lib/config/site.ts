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
    { href: "/#categories", label: "Eyewear" },
    { href: "/#featured", label: "Watches" },
    { href: "/#brands", label: "Pens" },
    { href: "/#categories", label: "Contact Lenses" },
  ],
  whatsapp: {
    production: productionWhatsApp,
    test: testWhatsApp,
  },
} as const;

export function resolveDeploymentEnvironment(
  vercelEnvironment = process.env.VERCEL_ENV,
  nodeEnvironment = process.env.NODE_ENV,
): DeploymentEnvironment {
  if (vercelEnvironment === "production") return "production";
  if (vercelEnvironment === "preview") return "preview";
  if (nodeEnvironment === "test") return "test";
  return "development";
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
