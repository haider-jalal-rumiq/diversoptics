import { Reveal } from "@/components/ui/reveal";
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
          {/*
            The stagger restarts every row so a long catalog page never builds up
            a delay measured in seconds, and the first row skips the reveal
            entirely because it is usually already on screen at load.
          */}
          <Reveal className="h-full" delay={(index % 3) * 70}>
            {/* Only the first row can be above the fold, so only it takes priority. */}
            <CatalogProductCard priority={index < 3} product={product} />
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
