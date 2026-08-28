import type { Route } from "next";
import Link from "next/link";

import {
  formatAvailabilityLabel,
  formatPriceLabel,
} from "@/features/catalog/domain/price";
import type { ProductSummary } from "@/features/catalog/domain/types";

import { ProductImage } from "./product-image";
import { ShortlistButton } from "./shortlist-button";

const CARD_IMAGE_SIZES =
  "(min-width: 1024px) 17rem, (min-width: 640px) 33vw, 80vw";

export function CatalogProductCard({
  priority = false,
  product,
}: {
  priority?: boolean;
  product: ProductSummary;
}) {
  const priceLabel = formatPriceLabel(product);

  return (
    <article className="group/card relative flex h-full min-w-[17.25rem] flex-col rounded-xl border border-smoke/60 bg-white p-[15px] shadow-card transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-orbit-gold hover:shadow-[0_18px_40px_rgb(21_21_21/0.12)] motion-safe:hover:-translate-y-1 sm:min-w-0">
      <Link
        className="group focus-visible:outline-none"
        href={product.href as Route}
      >
        <ProductImage
          compact
          image={product.primaryImage}
          priority={priority}
          sizes={CARD_IMAGE_SIZES}
        />
      </Link>

      <ShortlistButton
        className="absolute right-6 top-6"
        productName={product.name}
        slug={product.slug}
      />

      <div className="mt-4 inline-flex min-h-[30px] w-fit items-center rounded-full border border-orbit-gold px-3 text-[11px] font-semibold">
        {formatAvailabilityLabel(product.availability)}
      </div>

      {product.eyebrow ? (
        <p className="mt-4 text-[11px] font-semibold tracking-[0.06em] text-smoke">
          {product.eyebrow}
        </p>
      ) : null}

      <h3 className="mt-1 text-xl font-semibold leading-7">
        <Link className="hover:underline" href={product.href as Route}>
          {product.name}
        </Link>
      </h3>

      <p className="mt-1 text-xs font-medium text-smoke">{product.sku}</p>

      {/* A hidden price mode renders no price line at all rather than an empty one. */}
      {priceLabel ? (
        <p className="mt-3 text-base font-semibold">{priceLabel}</p>
      ) : null}

      <Link
        className="mt-auto inline-flex min-h-11 items-center pt-3 text-sm text-smoke hover:underline"
        href={product.href as Route}
      >
        View details
      </Link>
    </article>
  );
}
