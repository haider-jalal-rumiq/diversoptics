import type { CategoryInput } from "../domain/categories";
import type {
  CatalogBrand,
  CatalogCollection,
  EditorialPage,
  ProductAttributeValue,
  ProductSummary,
  ProductVariantOption,
  StoreSettings,
} from "../domain/types";

/**
 * Every fixture is marked `demo` so no component can present it as verified
 * inventory. Names, models and prices here are invented placeholders: AGENTS.md
 * forbids real brand or model names until inventory and usage rights are
 * confirmed, and forbids inventing a price the business has not approved.
 *
 * This data exists so the catalog, filtering, product, shortlist and inquiry
 * journeys can be built and tested before the pilot product set arrives.
 */

export const demoCategoryRows = [
  {
    demo: true,
    description: "Optical frames, sunglasses and lens services.",
    eyebrow: "EYEWEAR",
    id: "demo-cat-eyewear",
    name: "Eyewear",
    parentId: null,
    slug: "eyewear",
  },
  {
    demo: true,
    description: "Everyday frames; fitting confirmed in store.",
    eyebrow: "EYEWEAR",
    id: "demo-cat-optical",
    name: "Optical frames",
    parentId: "demo-cat-eyewear",
    slug: "optical-frames",
  },
  {
    demo: true,
    description: "Sun protection styles for daily wear.",
    eyebrow: "EYEWEAR",
    id: "demo-cat-sunglasses",
    name: "Sunglasses",
    parentId: "demo-cat-eyewear",
    slug: "sunglasses",
  },
  {
    demo: true,
    description: "Lens options and in-store services.",
    eyebrow: "SERVICE",
    id: "demo-cat-lenses",
    name: "Lens options",
    parentId: "demo-cat-eyewear",
    slug: "lenses",
  },
  {
    demo: true,
    description: "Considered timepieces for daily wear and gifting.",
    eyebrow: "TIMEPIECES",
    id: "demo-cat-watches",
    name: "Watches",
    parentId: null,
    slug: "watches",
  },
  {
    demo: true,
    description: "Pens and writing instruments for gifts and daily use.",
    eyebrow: "WRITING",
    id: "demo-cat-pens",
    name: "Writing instruments",
    parentId: null,
    slug: "writing-instruments",
  },
] as const satisfies readonly CategoryInput[];

export const demoBrands = [
  {
    categoryLabel: "",
    demo: true,
    description: "A placeholder eyewear house used to exercise brand pages.",
    href: "/brands/demo-brand-aurora",
    id: "demo-brand-aurora",
    logoPath: null,
    name: "Demo Aurora",
    slug: "demo-brand-aurora",
  },
  {
    categoryLabel: "",
    demo: true,
    description: "A placeholder watch label used to exercise brand pages.",
    href: "/brands/demo-brand-meridian",
    id: "demo-brand-meridian",
    logoPath: null,
    name: "Demo Meridian",
    slug: "demo-brand-meridian",
  },
  {
    categoryLabel: "",
    demo: true,
    description: "A placeholder writing-instrument label.",
    href: "/brands/demo-brand-quill",
    id: "demo-brand-quill",
    logoPath: null,
    name: "Demo Quill",
    slug: "demo-brand-quill",
  },
] as const satisfies readonly CatalogBrand[];

export const demoCollections = [
  {
    demo: true,
    description: "A placeholder edit used to exercise collection routing.",
    eyebrow: "THE GOLDEN EDIT",
    href: "/collections/demo-golden-edit",
    id: "demo-collection-golden",
    name: "Demo golden edit",
    slug: "demo-golden-edit",
  },
] as const satisfies readonly CatalogCollection[];

type DemoProduct = ProductSummary & {
  attributes: readonly ProductAttributeValue[];
  categoryId: string;
  collectionSlugs: readonly string[];
  description: string;
  variants: readonly ProductVariantOption[];
};

function demoProduct(input: {
  attributes?: readonly ProductAttributeValue[];
  availability: ProductSummary["availability"];
  brandSlug: string;
  brandName: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  collectionSlugs?: readonly string[];
  eyebrow: string;
  featured?: boolean;
  id: string;
  name: string;
  price: number | null;
  priceMode: ProductSummary["priceMode"];
  shortDescription: string;
  sku: string;
  slug: string;
  variants?: readonly ProductVariantOption[];
}): DemoProduct {
  return {
    attributes: input.attributes ?? [],
    availability: input.availability,
    brandName: input.brandName,
    brandSlug: input.brandSlug,
    categoryId: input.categoryId,
    categoryName: input.categoryName,
    categorySlug: input.categorySlug,
    collectionSlugs: input.collectionSlugs ?? [],
    currency: "PKR",
    demo: true,
    description:
      "Placeholder description. Verified copy, specifications and imagery arrive with the approved pilot product set.",
    eyebrow: input.eyebrow,
    featured: input.featured ?? false,
    href: `/products/${input.slug}`,
    id: input.id,
    modelNumber: input.sku,
    name: input.name,
    price: input.price,
    priceMode: input.priceMode,
    primaryImage: null,
    shortDescription: input.shortDescription,
    sku: input.sku,
    slug: input.slug,
    status: "published",
    variants: input.variants ?? [],
  };
}

export const demoProducts: readonly DemoProduct[] = [
  demoProduct({
    attributes: [
      {
        displayValue: "Acetate",
        key: "material",
        name: "Material",
        valueType: "text",
      },
      {
        displayValue: "Round",
        key: "shape",
        name: "Shape",
        valueType: "option",
      },
      {
        displayValue: "52",
        key: "lens-width",
        name: "Lens width (mm)",
        valueType: "number",
      },
    ],
    availability: "in_store",
    brandName: "Demo Aurora",
    brandSlug: "demo-brand-aurora",
    categoryId: "demo-cat-optical",
    categoryName: "Optical frames",
    categorySlug: "optical-frames",
    collectionSlugs: ["demo-golden-edit"],
    eyebrow: "DEMO EYEWEAR",
    featured: true,
    id: "demo-product-frame-01",
    name: "Demo Frame 01",
    price: 18500,
    priceMode: "fixed",
    shortDescription: "Placeholder round acetate frame.",
    sku: "DEMO-EYE-001",
    slug: "demo-frame-01",
    variants: [
      {
        availability: "in_store",
        id: "demo-variant-frame-01-black",
        name: "Black",
        price: null,
        priceMode: null,
        sku: "DEMO-EYE-001-BLK",
      },
      {
        availability: "available_to_order",
        id: "demo-variant-frame-01-tortoise",
        name: "Tortoise",
        price: 19500,
        priceMode: "fixed",
        sku: "DEMO-EYE-001-TRT",
      },
    ],
  }),
  demoProduct({
    availability: "available_to_order",
    brandName: "Demo Aurora",
    brandSlug: "demo-brand-aurora",
    categoryId: "demo-cat-optical",
    categoryName: "Optical frames",
    categorySlug: "optical-frames",
    eyebrow: "DEMO EYEWEAR",
    id: "demo-product-frame-02",
    name: "Demo Frame 02",
    price: 24000,
    priceMode: "fixed",
    shortDescription: "Placeholder rectangular metal frame.",
    sku: "DEMO-EYE-002",
    slug: "demo-frame-02",
  }),
  demoProduct({
    attributes: [
      {
        displayValue: "Yes",
        key: "polarized",
        name: "Polarized",
        valueType: "boolean",
      },
    ],
    availability: "in_store",
    brandName: "Demo Aurora",
    brandSlug: "demo-brand-aurora",
    categoryId: "demo-cat-sunglasses",
    categoryName: "Sunglasses",
    categorySlug: "sunglasses",
    collectionSlugs: ["demo-golden-edit"],
    eyebrow: "DEMO SUNGLASSES",
    featured: true,
    id: "demo-product-sun-01",
    name: "Demo Sunglasses 01",
    price: 21000,
    priceMode: "from",
    shortDescription: "Placeholder polarized sun style.",
    sku: "DEMO-SUN-001",
    slug: "demo-sunglasses-01",
  }),
  demoProduct({
    availability: "out_of_stock",
    brandName: "Demo Aurora",
    brandSlug: "demo-brand-aurora",
    categoryId: "demo-cat-sunglasses",
    categoryName: "Sunglasses",
    categorySlug: "sunglasses",
    eyebrow: "DEMO SUNGLASSES",
    id: "demo-product-sun-02",
    name: "Demo Sunglasses 02",
    price: null,
    priceMode: "on_inquiry",
    shortDescription: "Placeholder aviator style.",
    sku: "DEMO-SUN-002",
    slug: "demo-sunglasses-02",
  }),
  demoProduct({
    availability: "ask",
    brandName: "Demo Aurora",
    brandSlug: "demo-brand-aurora",
    categoryId: "demo-cat-lenses",
    categoryName: "Lens options",
    categorySlug: "lenses",
    eyebrow: "DEMO LENS SERVICE",
    id: "demo-product-lens-01",
    name: "Demo Lens Option 01",
    price: null,
    priceMode: "on_inquiry",
    shortDescription: "Placeholder lens service entry.",
    sku: "DEMO-LEN-001",
    slug: "demo-lens-option-01",
  }),
  demoProduct({
    attributes: [
      {
        displayValue: "Automatic",
        key: "movement",
        name: "Movement",
        valueType: "option",
      },
      {
        displayValue: "40",
        key: "case-size",
        name: "Case size (mm)",
        valueType: "number",
      },
    ],
    availability: "in_store",
    brandName: "Demo Meridian",
    brandSlug: "demo-brand-meridian",
    categoryId: "demo-cat-watches",
    categoryName: "Watches",
    categorySlug: "watches",
    collectionSlugs: ["demo-golden-edit"],
    eyebrow: "DEMO WATCH",
    featured: true,
    id: "demo-product-watch-01",
    name: "Demo Watch 01",
    price: 96000,
    priceMode: "fixed",
    shortDescription: "Placeholder automatic watch.",
    sku: "DEMO-WAT-001",
    slug: "demo-watch-01",
  }),
  demoProduct({
    availability: "available_to_order",
    brandName: "Demo Meridian",
    brandSlug: "demo-brand-meridian",
    categoryId: "demo-cat-watches",
    categoryName: "Watches",
    categorySlug: "watches",
    eyebrow: "DEMO WATCH",
    id: "demo-product-watch-02",
    name: "Demo Watch 02",
    price: 42000,
    priceMode: "fixed",
    shortDescription: "Placeholder quartz watch.",
    sku: "DEMO-WAT-002",
    slug: "demo-watch-02",
  }),
  demoProduct({
    attributes: [
      { displayValue: "Medium", key: "nib", name: "Nib", valueType: "option" },
      {
        displayValue: "Brass, Resin",
        key: "materials",
        name: "Materials",
        valueType: "multi_option",
      },
    ],
    availability: "in_store",
    brandName: "Demo Quill",
    brandSlug: "demo-brand-quill",
    categoryId: "demo-cat-pens",
    categoryName: "Writing instruments",
    categorySlug: "writing-instruments",
    eyebrow: "DEMO PEN",
    featured: true,
    id: "demo-product-pen-01",
    name: "Demo Pen 01",
    price: 12500,
    priceMode: "fixed",
    shortDescription: "Placeholder fountain pen.",
    sku: "DEMO-PEN-001",
    slug: "demo-pen-01",
  }),
  demoProduct({
    availability: "ask",
    brandName: "Demo Quill",
    brandSlug: "demo-brand-quill",
    categoryId: "demo-cat-pens",
    categoryName: "Writing instruments",
    categorySlug: "writing-instruments",
    eyebrow: "DEMO PEN",
    id: "demo-product-pen-02",
    name: "Demo Pen 02",
    price: null,
    priceMode: "on_inquiry",
    shortDescription: "Placeholder rollerball pen.",
    sku: "DEMO-PEN-002",
    slug: "demo-pen-02",
  }),
] as const;

export const demoPages = [
  {
    bodyMarkdown:
      "## Placeholder guide\n\nThis is fixture content used to exercise guide routing. Verified, professionally reviewed guidance replaces it before launch.",
    excerpt: "Fixture guide used to exercise routing.",
    href: "/guides/demo-frame-measurements",
    kind: "guide",
    slug: "demo-frame-measurements",
    title: "How frame size is measured (placeholder)",
  },
  {
    bodyMarkdown:
      "## Placeholder policy\n\nNo warranty, return or authenticity claim is made here. Confirmed policy text replaces this fixture before launch.",
    excerpt: "Fixture policy used to exercise routing.",
    href: "/policies/demo-service-policy",
    kind: "policy",
    slug: "demo-service-policy",
    title: "Service policy (placeholder)",
  },
] as const satisfies readonly EditorialPage[];

/**
 * Only the two facts Phase 01 already confirmed are represented. Address, hours,
 * phone and email stay null so the store page renders an explicit "not yet
 * confirmed" state instead of a plausible-looking invention.
 */
export const demoStoreSettings: StoreSettings = {
  businessHours: [],
  deliveryAvailable: true,
  fullAddress: null,
  locationLabel: "F-11 Markaz, Islamabad",
  phoneNumber: null,
  publicEmail: null,
  whatsappNumber: "03438067821",
};
