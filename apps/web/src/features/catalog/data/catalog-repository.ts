import type { CatalogRepository, ProductSummary } from "../domain/types";
import { demoBrands, demoCategories, demoProducts } from "./demo-fixtures";

const demoCatalogRepository: CatalogRepository = {
  async getCategories() {
    return demoCategories;
  },
  async getFeaturedProducts() {
    return demoProducts;
  },
  async getFeaturedBrands() {
    return demoBrands;
  },
  async getProductBySlug(slug) {
    return demoProducts.find((product) => product.slug === slug) ?? null;
  },
};

const emptyCatalogRepository: CatalogRepository = {
  async getCategories() {
    return [];
  },
  async getFeaturedProducts() {
    return [];
  },
  async getFeaturedBrands() {
    return [];
  },
  async getProductBySlug() {
    return null;
  },
};

/**
 * Fictional data is available in local and protected preview environments only.
 * A production deployment stays safely empty until Phase 02 provides Supabase data.
 */
export function createCatalogRepository(
  vercelEnvironment = process.env.VERCEL_ENV,
): CatalogRepository {
  return vercelEnvironment === "production"
    ? emptyCatalogRepository
    : demoCatalogRepository;
}

export function formatPriceLabel(
  product: Pick<ProductSummary, "priceMode">,
): string | null {
  if (product.priceMode === "hidden") return null;
  if (product.priceMode === "on_inquiry") return "Price on inquiry";
  return product.priceMode === "from"
    ? "Price from — pending"
    : "Price pending";
}
