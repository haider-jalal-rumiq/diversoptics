import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductMediaPlaceholder } from "@/components/home/product-media-placeholder";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { createCatalogRepository } from "@/features/catalog/data/catalog-repository";
import { formatPriceLabel } from "@/features/catalog/domain/price";
import { buildGeneralWhatsAppHref } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Fixture product preview",
};

type PreviewProductPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PreviewProductPage({
  params,
}: PreviewProductPageProps) {
  const { slug } = await params;
  const product = await createCatalogRepository().getProductBySlug(slug);

  if (!product) notFound();

  return (
    <main className="min-h-screen bg-porcelain py-8 sm:py-16">
      <Container>
        <Link
          className="inline-flex min-h-11 items-center text-sm font-semibold hover:underline"
          href="/"
        >
          ← Back to the home preview
        </Link>
        <div className="mt-8 grid gap-8 rounded-xl bg-white p-5 shadow-card sm:grid-cols-2 sm:p-8">
          <ProductMediaPlaceholder />
          <div className="self-center">
            <p className="text-xs font-semibold tracking-[0.08em] text-smoke">
              FICTIONAL FIXTURE · NOT REAL INVENTORY
            </p>
            <h1 className="mt-4 font-display text-5xl leading-none">
              {product.name}
            </h1>
            <p className="mt-4 text-sm font-medium text-smoke">
              Model/SKU: {product.sku}
            </p>
            <p className="mt-6 text-base font-semibold">
              {formatPriceLabel(product)}
            </p>
            <p className="mt-3 text-base leading-7 text-smoke">
              This protected preview validates the product-card and detail-shell
              contract. Verified images, descriptions, variants and availability
              will come from the CMS.
            </p>
            <Button asChild className="mt-7" tone="green">
              <a href={buildGeneralWhatsAppHref()}>Ask on WhatsApp</a>
            </Button>
          </div>
        </div>
      </Container>
    </main>
  );
}
