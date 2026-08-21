import type {
  CatalogBrand,
  CatalogCategory,
  ProductSummary,
} from "@/features/catalog/domain/types";
import {
  buildGeneralWhatsAppHref,
  getWhatsAppDestination,
} from "@/lib/config/site";

import { Button } from "../ui/button";
import { Container } from "../ui/container";
import { SiteFooter } from "../site/site-footer";
import { SiteHeader } from "../site/site-header";
import { BrandTile } from "./brand-tile";
import { CategoryCard } from "./category-card";
import { OrbitHero } from "./orbit-hero";
import { ProductCard } from "./product-card";
import { SectionHeading } from "./section-heading";

export function HomePage({
  brands,
  categories,
  products,
}: {
  brands: readonly CatalogBrand[];
  categories: readonly CatalogCategory[];
  products: readonly ProductSummary[];
}) {
  const whatsappDestination = getWhatsAppDestination();

  return (
    <>
      <SiteHeader />
      <main>
        <OrbitHero />

        <section
          className="content-auto bg-porcelain py-[4.5rem]"
          id="categories"
        >
          <Container className="sm:max-w-[55rem]">
            <SectionHeading
              eyebrow="CURATED FOR EVERYDAY LIFE"
              title="Choose your starting point."
            />
            <div className="mt-7 flex snap-x gap-4 overflow-x-auto pb-4 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0">
              {categories.map((category) => (
                <CategoryCard category={category} key={category.id} />
              ))}
            </div>
          </Container>
        </section>

        <section className="content-auto bg-white py-[4.5rem]" id="featured">
          <Container className="sm:max-w-[55rem]">
            <div className="flex items-end justify-between gap-5">
              <SectionHeading
                eyebrow="THE GOLDEN EDIT"
                title="Featured arrivals."
              />
              <span className="hidden text-sm font-semibold tracking-[0.06em] sm:block">
                Preview products →
              </span>
            </div>
            <div className="mt-7 flex snap-x gap-4 overflow-x-auto pb-4 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {products.length === 0 ? (
              <p className="mt-8 rounded-xl border border-smoke/30 bg-porcelain p-6 text-sm text-smoke">
                The production catalog remains unpublished until verified
                products are connected in Phase 02.
              </p>
            ) : null}
          </Container>
        </section>

        <section className="content-auto bg-obsidian py-[4.5rem]" id="brands">
          <Container>
            <SectionHeading
              eyebrow="SHOP BY BRAND"
              inverse
              title="A quieter way to browse the names you know."
            />
            <div className="mt-7 flex snap-x gap-[18px] overflow-x-auto pb-4 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0">
              {brands.map((brand) => (
                <BrandTile brand={brand} key={brand.id} />
              ))}
            </div>
          </Container>
        </section>

        <section className="content-auto bg-porcelain py-20">
          <Container>
            <p className="text-sm font-semibold tracking-[0.08em]">
              LOCAL EXPERTISE · HUMAN ADVICE
            </p>
            <h2 className="mt-5 max-w-[51rem] font-display text-[3.5rem] leading-[1.02] tracking-[-0.01em] sm:text-6xl">
              See the details online. Decide with confidence in store.
            </h2>
            <p className="mt-7 max-w-[42.5rem] text-lg leading-8 text-smoke">
              Product pages lead with fit, use and verified specifications. For
              lens guidance, availability and delivery, speak directly with the
              Diverso team.
            </p>
          </Container>
        </section>

        <section className="content-auto bg-orbit-gold py-16" id="store">
          <Container>
            <p className="text-sm font-semibold tracking-[0.08em]">
              VISIT F-11 MARKAZ, ISLAMABAD
            </p>
            <h2 className="mt-4 max-w-[47.5rem] font-display text-[2.5rem] leading-[1.05] sm:text-5xl">
              Your shortlist, ready for a human conversation.
            </h2>
            <Button
              asChild
              className="mt-6 border border-obsidian bg-obsidian text-porcelain hover:bg-charcoal"
            >
              <a href={buildGeneralWhatsAppHref()}>
                Ask on WhatsApp · {whatsappDestination.display}
              </a>
            </Button>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
