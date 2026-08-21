import type { ProductDetail, StoreSettings } from "./types";

export type BreadcrumbEntry = { href: string | null; label: string };

const SCHEMA_AVAILABILITY = {
  ask: null,
  available_to_order: "https://schema.org/BackOrder",
  in_store: "https://schema.org/InStoreOnly",
  out_of_stock: "https://schema.org/OutOfStock",
} as const;

/**
 * Product structured data for a catalog that does not sell online.
 *
 * An Offer is emitted only when a real price exists. AGENTS.md forbids inventing
 * pricing, and a zero or absent price in structured data is worse than none: it
 * would advertise a number the business never approved. Ratings and reviews are
 * never emitted because no verified review source is connected yet.
 */
export function buildProductSchema(input: {
  imageUrls: readonly string[];
  product: ProductDetail;
  settings: StoreSettings | null;
  url: string;
}): Record<string, unknown> {
  const { imageUrls, product, settings, url } = input;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    url,
  };

  if (product.modelNumber) schema.mpn = product.modelNumber;
  if (imageUrls.length > 0) schema.image = [...imageUrls];

  const description = product.shortDescription ?? product.description;

  if (description) schema.description = description;

  if (product.brandName) {
    schema.brand = { "@type": "Brand", name: product.brandName };
  }

  if (product.categoryName) schema.category = product.categoryName;

  const hasRealPrice =
    (product.priceMode === "fixed" || product.priceMode === "from") &&
    product.price !== null &&
    product.price > 0;

  if (hasRealPrice) {
    const availability = SCHEMA_AVAILABILITY[product.availability];

    schema.offers = {
      "@type": "Offer",
      ...(availability ? { availability } : {}),
      price: product.price,
      priceCurrency: product.currency,
      // The catalog is a lead-generation surface, so the offer points at the
      // product page rather than a checkout that does not exist.
      url,
      ...(settings
        ? { seller: { "@type": "LocalBusiness", name: "Diverso Optics" } }
        : {}),
    };
  }

  const specifications = product.attributes.filter(
    (attribute) => attribute.displayValue.length > 0,
  );

  if (specifications.length > 0) {
    schema.additionalProperty = specifications.map((attribute) => ({
      "@type": "PropertyValue",
      name: attribute.name,
      value: attribute.displayValue,
    }));
  }

  return schema;
}

/**
 * Built from the same trail the page renders, so the visible breadcrumb and the
 * structured data cannot disagree. Entries without a URL are dropped because a
 * BreadcrumbList item needs one to be useful.
 */
export function buildBreadcrumbSchema(
  trail: readonly BreadcrumbEntry[],
  absolute: (path: string) => string,
): Record<string, unknown> | null {
  const items = trail.flatMap((entry, index) =>
    entry.href
      ? [
          {
            "@type": "ListItem",
            item: absolute(entry.href),
            name: entry.label,
            position: index + 1,
          },
        ]
      : [],
  );

  if (items.length < 2) return null;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}

/**
 * LocalBusiness data must match the visible facts exactly, so every optional
 * field is emitted only when the CMS actually holds it. AGENTS.md forbids
 * inventing an address, phone number or opening hours.
 */
export function buildLocalBusinessSchema(input: {
  settings: StoreSettings;
  siteUrl: string;
}): Record<string, unknown> {
  const { settings, siteUrl } = input;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "Diverso Optics",
    url: siteUrl,
  };

  if (settings.fullAddress) {
    schema.address = {
      "@type": "PostalAddress",
      addressCountry: "PK",
      addressLocality: "Islamabad",
      streetAddress: settings.fullAddress,
    };
  } else {
    // Without a confirmed street address only the area is stated, which is the
    // one location fact Phase 00 established.
    schema.address = {
      "@type": "PostalAddress",
      addressCountry: "PK",
      addressLocality: "Islamabad",
      addressRegion: settings.locationLabel,
    };
  }

  if (settings.phoneNumber) schema.telephone = settings.phoneNumber;
  if (settings.publicEmail) schema.email = settings.publicEmail;

  const openingHours = settings.businessHours.flatMap((entry) =>
    entry.closed || !entry.opens || !entry.closes
      ? []
      : [
          {
            "@type": "OpeningHoursSpecification",
            closes: entry.closes,
            dayOfWeek: entry.day,
            opens: entry.opens,
          },
        ],
  );

  if (openingHours.length > 0) schema.openingHoursSpecification = openingHours;

  return schema;
}
