/**
 * The primary navigation is deliberately curated instead of mirroring every
 * CMS node. The category tree can grow freely while the header keeps the five
 * customer-facing shopping tasks approved by the client.
 *
 * Brand names here are filters, not authorization claims. Their links stay on
 * valid category pages even before the corresponding products are published.
 */
export type CatalogNavigationLink = {
  href: string;
  label: string;
};

export type CatalogNavigationSection = {
  heading: string;
  links: readonly CatalogNavigationLink[];
};

export type CatalogNavigationItem = {
  description: string;
  href: string;
  label: string;
  sections: readonly CatalogNavigationSection[];
};

const BRANDED_EYEWEAR = [
  ["Chopard", "chopard"],
  ["Tom Ford", "tom-ford"],
  ["Porsche Design", "porsche-design"],
  ["Ray-Ban", "ray-ban"],
  ["Versace", "versace"],
  ["Prada", "prada"],
  ["Police", "police"],
  ["Carrera", "carrera"],
  ["Ralph Lauren", "ralph-lauren"],
  ["Persol", "persol"],
  ["Swarovski", "swarovski"],
] as const;

const REPLICA_EYEWEAR = [
  ["Tom Ford", "tom-ford"],
  ["Celine", "celine"],
  ["Gucci", "gucci"],
  ["Cartier", "cartier"],
  ["Versace", "versace"],
  ["Louis Vuitton", "louis-vuitton"],
  ["Miu Miu", "miu-miu"],
  ["Prada", "prada"],
] as const;

function brandLinks(
  basePath: string,
  brands: readonly (readonly [label: string, slug: string])[],
  query?: string,
): readonly CatalogNavigationLink[] {
  return brands.map(([label, slug]) => ({
    href: `${basePath}?brand=${slug}${query ? `&q=${query}` : ""}`,
    label,
  }));
}

export const catalogNavigation = [
  {
    description:
      "Explore sunwear by collection, label, and the style you have in mind.",
    href: "/eyewear/sunglasses",
    label: "Sunglasses",
    sections: [
      {
        heading: "Shop sunglasses",
        links: [
          { href: "/eyewear/sunglasses", label: "All sunglasses" },
          {
            href: "/eyewear/sunglasses?q=branded",
            label: "Branded",
          },
          {
            href: "/eyewear/sunglasses?q=non-branded",
            label: "Non-branded",
          },
          {
            href: "/eyewear/sunglasses?q=replica",
            label: "Replicas",
          },
        ],
      },
      {
        heading: "Branded",
        links: brandLinks("/eyewear/sunglasses", BRANDED_EYEWEAR),
      },
      {
        heading: "Replica styles",
        links: brandLinks("/eyewear/sunglasses", REPLICA_EYEWEAR, "replica"),
      },
    ],
  },
  {
    description:
      "Browse optical frames by label, then ask the store team about fit.",
    href: "/eyewear/optical-frames",
    label: "Optical Frames",
    sections: [
      {
        heading: "Shop frames",
        links: [
          { href: "/eyewear/optical-frames", label: "All optical frames" },
          {
            href: "/eyewear/optical-frames?q=branded",
            label: "Branded",
          },
          {
            href: "/eyewear/optical-frames?q=replica",
            label: "Replicas",
          },
        ],
      },
      {
        heading: "Brands",
        links: brandLinks("/eyewear/optical-frames", BRANDED_EYEWEAR),
      },
      {
        heading: "Replica styles",
        links: brandLinks(
          "/eyewear/optical-frames",
          REPLICA_EYEWEAR,
          "replica",
        ),
      },
    ],
  },
  {
    description:
      "Discover writing instruments selected for gifting and daily use.",
    href: "/writing-instruments",
    label: "Pens",
    sections: [
      {
        heading: "Writing instruments",
        links: [
          { href: "/writing-instruments", label: "All pens" },
          {
            href: "/writing-instruments?brand=montblanc",
            label: "Montblanc",
          },
        ],
      },
    ],
  },
  {
    description:
      "Find everyday and statement timepieces from the requested labels.",
    href: "/watches",
    label: "Watches",
    sections: [
      {
        heading: "Watch brands",
        links: brandLinks("/watches", [
          ["Casio", "casio"],
          ["Armani", "armani"],
          ["Casio Edifice", "casio-edifice"],
          ["Michael Kors", "michael-kors"],
          ["Fossil", "fossil"],
          ["G-Shock", "g-shock"],
        ]),
      },
    ],
  },
  {
    description:
      "Start with the wider eyewear edit and narrow the catalog from there.",
    href: "/eyewear",
    label: "Eyewear",
    sections: [
      {
        heading: "Explore eyewear",
        links: [
          { href: "/eyewear", label: "All eyewear" },
          { href: "/eyewear?q=replica", label: "Replica" },
          { href: "/eyewear?q=non-branded", label: "Non-branded" },
          { href: "/eyewear/sunglasses", label: "Sunglasses" },
        ],
      },
    ],
  },
] as const satisfies readonly CatalogNavigationItem[];
