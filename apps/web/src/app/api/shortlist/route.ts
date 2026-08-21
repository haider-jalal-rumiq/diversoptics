import { NextResponse } from "next/server";

import { createCatalogRepository } from "@/features/catalog/data/catalog-repository";
import {
  formatAvailabilityLabel,
  formatPriceLabel,
} from "@/features/catalog/domain/price";
import {
  isProductSlug,
  SHORTLIST_LIMIT,
} from "@/features/catalog/domain/shortlist";
import type { ShortlistApiProduct } from "@/features/catalog/domain/types";

/**
 * The shortlist lives in browser storage, so the page cannot be server-rendered
 * with its contents. This endpoint resolves the visitor's slugs into published
 * product summaries; it reads only public catalog data and takes no identifiers.
 */
export async function GET(request: Request) {
  const requested = new URL(request.url).searchParams.getAll("slug");

  const slugs = Array.from(
    new Set(requested.map((slug) => slug.trim().toLowerCase())),
  )
    .filter(isProductSlug)
    .slice(0, SHORTLIST_LIMIT);

  if (slugs.length === 0) {
    return NextResponse.json({ products: [] });
  }

  const products = await createCatalogRepository().getProductsBySlugs(slugs);

  return NextResponse.json({
    products: products.map((product): ShortlistApiProduct => ({
      availabilityLabel: formatAvailabilityLabel(product.availability),
      brandName: product.brandName,
      eyebrow: product.eyebrow,
      href: product.href,
      imagePath: product.primaryImage?.path ?? null,
      name: product.name,
      priceLabel: formatPriceLabel(product),
      sku: product.sku,
      slug: product.slug,
    })),
  });
}
