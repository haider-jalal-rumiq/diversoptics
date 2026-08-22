import type { ProductSummary } from "@/features/catalog/domain/types";

import { CatalogProductCard } from "./catalog-product-card";

export function ProductGrid({
  products,
}: {
  products: readonly ProductSummary[];
}) {
  return (
    <ul className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product, index) => (
        <li className="h-full" key={product.id}>
          {/* Only the first row can be above the fold, so only it takes priority. */}
          <CatalogProductCard priority={index < 3} product={product} />
        </li>
      ))}
    </ul>
  );
}
