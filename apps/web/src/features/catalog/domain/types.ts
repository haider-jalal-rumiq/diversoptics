export type PriceMode = "fixed" | "from" | "on_inquiry" | "hidden";

export type Availability =
  "in_store" | "available_to_order" | "out_of_stock" | "ask";

export type PublishStatus = "draft" | "published" | "archived";

export type StaffRole = "owner" | "editor" | "viewer";

export type CatalogCategory = {
  id: string;
  name: string;
  eyebrow: string;
  description: string;
  href: string;
  demo: true;
};

export type CatalogBrand = {
  id: string;
  name: string;
  categoryLabel: string;
  href: string;
  demo: boolean;
};

export type ProductSummary = {
  id: string;
  slug: string;
  name: string;
  sku: string;
  eyebrow: string;
  priceMode: PriceMode;
  availability: Availability;
  status: PublishStatus;
  href: string;
  demo: true;
};

export interface CatalogRepository {
  getCategories(): Promise<readonly CatalogCategory[]>;
  getFeaturedProducts(): Promise<readonly ProductSummary[]>;
  getFeaturedBrands(): Promise<readonly CatalogBrand[]>;
  getProductBySlug(slug: string): Promise<ProductSummary | null>;
}
