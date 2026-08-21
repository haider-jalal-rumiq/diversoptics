import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { CatalogProductCard } from "@/components/catalog/catalog-product-card";
import { DemoCatalogNotice } from "@/components/catalog/demo-catalog-notice";
import { ProductGallery } from "@/components/catalog/product-gallery";
import { ProductInquiryPanel } from "@/components/catalog/product-inquiry-panel";
import { JsonLd } from "@/components/seo/json-ld";
import { SiteShell } from "@/components/site/site-shell";
import { Container } from "@/components/ui/container";
import {
  createCatalogRepository,
  isDemoCatalog,
} from "@/features/catalog/data/catalog-repository";
import { getStoreSettings } from "@/features/catalog/data/store-settings";
import {
  collectCategoryIds,
  findCategoryByHref,
} from "@/features/catalog/domain/categories";
import { DEFAULT_CATALOG_FILTERS } from "@/features/catalog/domain/filters";
import { buildStorageImageUrl } from "@/features/catalog/domain/media";
import {
  buildBreadcrumbSchema,
  buildProductSchema,
} from "@/features/catalog/domain/structured-data";
import type { ProductDetail } from "@/features/catalog/domain/types";
import { absoluteUrl } from "@/lib/config/site";

async function loadProduct(slug: string): Promise<ProductDetail> {
  const product = await createCatalogRepository().getProductBySlug(slug);

  if (!product) notFound();

  return product;
}

function trailFor(product: ProductDetail) {
  return [
    { href: "/", label: "Home" },
    ...(product.categoryHref && product.categoryName
      ? [{ href: product.categoryHref, label: product.categoryName }]
      : []),
    { href: product.href, label: product.name },
  ];
}

export async function generateMetadata(
  props: PageProps<"/products/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await loadProduct(slug);
  const imageUrl = product.images[0]
    ? buildStorageImageUrl(product.images[0].path)
    : null;

  const description =
    product.shortDescription ??
    product.description ??
    `${product.name} — model ${product.modelNumber} at Diverso Optics, F-11 Markaz, Islamabad.`;

  return {
    alternates: { canonical: product.href },
    description,
    openGraph: {
      description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
      title: product.name,
      type: "website",
    },
    title: product.name,
  };
}

export default async function ProductPage(
  props: PageProps<"/products/[slug]">,
) {
  const { slug } = await props.params;
  const repository = createCatalogRepository();
  const product = await loadProduct(slug);

  const [settings, tree] = await Promise.all([
    getStoreSettings(),
    repository.getCategoryTree(),
  ]);

  // "Related" stays factual: other published products in the same category
  // branch. Nothing is recommended on invented similarity.
  const categoryNode = product.categoryHref
    ? findCategoryByHref(tree, product.categoryHref)
    : null;

  const related = categoryNode
    ? await repository.listProducts({
        categoryIds: collectCategoryIds(categoryNode),
        filters: DEFAULT_CATALOG_FILTERS,
        pageSize: 4,
      })
    : null;

  const relatedProducts = (related?.products ?? []).filter(
    (entry) => entry.slug !== product.slug,
  );

  const trail = trailFor(product);
  const url = absoluteUrl(product.href);
  const imageUrls = product.images.flatMap((image) => {
    const source = buildStorageImageUrl(image.path);

    return source ? [source] : [];
  });

  const breadcrumbSchema = buildBreadcrumbSchema(trail, (path) =>
    absoluteUrl(path),
  );

  return (
    <SiteShell>
      <JsonLd
        data={buildProductSchema({ imageUrls, product, settings, url })}
      />
      {breadcrumbSchema ? <JsonLd data={breadcrumbSchema} /> : null}

      <main className="bg-porcelain py-8 sm:py-12" id="main">
        <Container className="sm:max-w-[70rem]">
          <div className="space-y-5">
            <Breadcrumbs trail={trail} />
            <DemoCatalogNotice active={isDemoCatalog()} />
          </div>

          <div className="mt-8 grid gap-8 rounded-xl bg-white p-5 shadow-card lg:grid-cols-2 lg:p-8">
            <ProductGallery
              images={product.images}
              productName={product.name}
            />

            <div>
              {product.brandName ? (
                <p className="text-xs font-semibold tracking-[0.08em] text-smoke">
                  {product.brandHref ? (
                    <Link
                      className="hover:underline"
                      href={product.brandHref as Route}
                    >
                      {product.brandName.toUpperCase()}
                    </Link>
                  ) : (
                    product.brandName.toUpperCase()
                  )}
                </p>
              ) : null}

              <h1 className="mt-3 font-display text-[2.75rem] leading-[1.03] tracking-[-0.01em] sm:text-5xl">
                {product.name}
              </h1>

              <p className="mt-3 text-sm font-medium text-smoke">
                Model/SKU: {product.modelNumber}
              </p>

              <ProductInquiryPanel product={product} />
            </div>
          </div>

          {product.shortDescription || product.description ? (
            <section className="mt-10" aria-labelledby="product-about">
              <h2
                className="font-display text-3xl leading-tight"
                id="product-about"
              >
                About this piece
              </h2>
              {product.shortDescription ? (
                <p className="mt-4 max-w-prose text-base leading-7">
                  {product.shortDescription}
                </p>
              ) : null}
              {product.description ? (
                <p className="mt-3 max-w-prose text-base leading-7 text-smoke">
                  {product.description}
                </p>
              ) : null}
            </section>
          ) : null}

          {product.attributes.length > 0 ? (
            <section className="mt-10" aria-labelledby="product-specs">
              <h2
                className="font-display text-3xl leading-tight"
                id="product-specs"
              >
                Specifications
              </h2>
              <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {product.attributes.map((attribute) => (
                  <div
                    className="flex justify-between gap-4 border-b border-smoke/25 pb-2 text-sm"
                    key={attribute.key}
                  >
                    <dt className="text-smoke">{attribute.name}</dt>
                    <dd className="font-medium">{attribute.displayValue}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          {product.variants.length > 0 ? (
            <section className="mt-10" aria-labelledby="product-options">
              <h2
                className="font-display text-3xl leading-tight"
                id="product-options"
              >
                Options and model codes
              </h2>
              <ul className="mt-4 list-none space-y-2 p-0 text-sm">
                {product.variants.map((variant) => (
                  <li
                    className="flex flex-wrap justify-between gap-3 border-b border-smoke/25 pb-2"
                    key={variant.id}
                  >
                    <span className="font-medium">{variant.name}</span>
                    <span className="text-smoke">{variant.sku}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {/*
            No authenticity, warranty or return claim is printed here. AGENTS.md
            requires client-supplied proof first, so the page points to a
            conversation instead of asserting a policy.
          */}
          <section
            aria-labelledby="product-service"
            className="mt-10 rounded-xl border border-smoke/30 bg-white p-6"
          >
            <h2
              className="font-display text-3xl leading-tight"
              id="product-service"
            >
              Buying this in F-11
            </h2>
            <p className="mt-3 max-w-prose text-sm leading-6 text-smoke">
              Fitting, lens guidance and current availability are handled in
              person or over WhatsApp. Warranty, exchange and authenticity terms
              are confirmed by the store for each item.
            </p>
            <Link
              className="mt-4 inline-flex min-h-11 items-center rounded-full border border-obsidian px-5 text-sm font-semibold"
              href="/store"
            >
              F-11 store details
            </Link>
          </section>

          {relatedProducts.length > 0 ? (
            <section className="mt-12" aria-labelledby="product-related">
              <h2
                className="font-display text-3xl leading-tight"
                id="product-related"
              >
                Also in the catalog
              </h2>
              <ul className="mt-5 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
                {relatedProducts.slice(0, 3).map((entry) => (
                  <li key={entry.id}>
                    <CatalogProductCard product={entry} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </Container>
      </main>
    </SiteShell>
  );
}
