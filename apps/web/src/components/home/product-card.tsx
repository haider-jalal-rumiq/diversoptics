import type { Route } from "next";
import Link from "next/link";

import { AssetIcon } from "@/components/ui/asset-icon";
import type { ProductSummary } from "@/features/catalog/domain/types";

import { ProductMediaPlaceholder } from "./product-media-placeholder";

export function ProductCard({ product }: { product: ProductSummary }) {
  return (
    <article className="relative min-w-[17.25rem] rounded-xl border border-smoke/60 bg-white p-[15px] shadow-card sm:min-w-0">
      <ProductMediaPlaceholder compact />
      <button
        aria-label={`Shortlist preview for ${product.name}`}
        className="absolute right-6 top-6 grid size-12 cursor-not-allowed place-items-center rounded-full bg-white shadow-card"
        disabled
        title="Shortlist interaction is introduced with the public catalog phase"
        type="button"
      >
        <AssetIcon name="heart" />
      </button>
      <div className="mt-4 inline-flex min-h-[30px] items-center rounded-full border border-orbit-gold px-3 text-[11px] font-semibold">
        Ask for availability
      </div>
      <p className="mt-4 text-[11px] font-semibold tracking-[0.06em] text-smoke">
        {product.eyebrow}
      </p>
      <h3 className="mt-1 text-xl font-semibold leading-7">{product.name}</h3>
      <p className="mt-1 text-xs font-medium text-smoke">{product.sku}</p>
      <Link
        className="mt-3 inline-flex min-h-11 items-center text-sm text-smoke hover:underline"
        href={product.href as Route}
      >
        View details
      </Link>
    </article>
  );
}
