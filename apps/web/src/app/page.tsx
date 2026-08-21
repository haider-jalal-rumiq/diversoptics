import { HomePage } from "@/components/home/home-page";
import { createCatalogRepository } from "@/features/catalog/data/catalog-repository";

export default async function Page() {
  const repository = createCatalogRepository();
  const [brands, categories, products] = await Promise.all([
    repository.getFeaturedBrands(),
    repository.getCategories(),
    repository.getFeaturedProducts(),
  ]);

  return (
    <HomePage brands={brands} categories={categories} products={products} />
  );
}
