import type {
  CatalogBrand,
  CatalogCategory,
  ProductSummary,
} from "../domain/types";

export const demoCategories = [
  {
    id: "demo-category-sunglasses",
    name: "Sunglasses",
    eyebrow: "EYEWEAR",
    description: "Ten curated brand edits, ready for a closer look.",
    href: "/#featured",
    demo: true,
  },
  {
    id: "demo-category-optical-frames",
    name: "Optical frames",
    eyebrow: "EYEWEAR",
    description: "Men, women and kids — fitting details confirmed in store.",
    href: "/#featured",
    demo: true,
  },
  {
    id: "demo-category-watches-pens",
    name: "Watches & pens",
    eyebrow: "COLLECTION",
    description:
      "Four watch brands and writing instruments for considered gifts.",
    href: "/#brands",
    demo: true,
  },
] as const satisfies readonly CatalogCategory[];

export const demoProducts = [
  {
    id: "demo-product-frame-01",
    slug: "demo-frame-01",
    name: "Demo Frame 01",
    sku: "DEMO-EYE-001",
    eyebrow: "DEMO EYEWEAR",
    priceMode: "on_inquiry",
    availability: "ask",
    status: "published",
    href: "/preview/products/demo-frame-01",
    demo: true,
  },
  {
    id: "demo-product-watch-01",
    slug: "demo-watch-01",
    name: "Demo Watch 01",
    sku: "DEMO-WAT-001",
    eyebrow: "DEMO WATCH",
    priceMode: "on_inquiry",
    availability: "ask",
    status: "published",
    href: "/preview/products/demo-watch-01",
    demo: true,
  },
  {
    id: "demo-product-pen-01",
    slug: "demo-pen-01",
    name: "Demo Pen 01",
    sku: "DEMO-PEN-001",
    eyebrow: "DEMO PEN",
    priceMode: "on_inquiry",
    availability: "ask",
    status: "published",
    href: "/preview/products/demo-pen-01",
    demo: true,
  },
] as const satisfies readonly ProductSummary[];

export const demoBrands = [
  {
    id: "demo-brand-a",
    name: "Demo Brand A",
    categoryLabel: "Eyewear",
    href: "/#featured",
    demo: true,
  },
  {
    id: "demo-brand-b",
    name: "Demo Brand B",
    categoryLabel: "Watches",
    href: "/#featured",
    demo: true,
  },
  {
    id: "montblanc-writing-instruments",
    name: "Montblanc",
    categoryLabel: "Writing instruments",
    href: "/#featured",
    demo: false,
  },
] as const satisfies readonly CatalogBrand[];
