import Link from "next/link";

import { CatalogProductCard } from "@/components/catalog/catalog-product-card";
import { DemoCatalogNotice } from "@/components/catalog/demo-catalog-notice";
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
import { Reveal } from "../ui/reveal";
import { BrandTile } from "./brand-tile";
import { CategoryCarousel } from "./category-carousel";
import { Hero } from "./hero";
import { SectionHeading } from "./section-heading";

export function HomePage({
  brands,
  categories,
  demo,
  products,
}: {
  brands: readonly CatalogBrand[];
  categories: readonly CatalogCategory[];
  demo: boolean;
  products: readonly ProductSummary[];
}) {
  const whatsappDestination = getWhatsAppDestination();

  return (
    <main id="main">
      <Hero />

      {demo ? (
        <div className="bg-porcelain pt-8">
          <Container>
            <DemoCatalogNotice active />
          </Container>
        </div>
      ) : null}

      <section
        className="content-auto bg-porcelain py-[4.5rem]"
        id="categories"
      >
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="CURATED FOR EVERYDAY LIFE"
              title="Choose your starting point."
            />
          </Reveal>
          <Reveal className="mt-7 block">
            <CategoryCarousel categories={categories} />
          </Reveal>
          {categories.length === 0 ? (
            <p className="mt-8 rounded-xl border border-smoke/30 bg-white p-6 text-sm text-smoke">
              Categories appear here once they are published in the CMS.
            </p>
          ) : null}
        </Container>
      </section>

      <section className="content-auto bg-white py-[4.5rem]" id="featured">
        <Container>
          <Reveal>
            <div className="flex items-end justify-between gap-5">
              <SectionHeading
                eyebrow="THE GOLDEN EDIT"
                title="Featured arrivals."
              />
              <Link
                className="hidden text-sm font-semibold tracking-[0.06em] hover:underline sm:block"
                href="/new-and-featured"
              >
                See all →
              </Link>
            </div>
          </Reveal>
          <ul className="mt-7 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-3">
            {products.slice(0, 3).map((product, index) => (
              <li key={product.id}>
                <Reveal delay={index * 80}>
                  <CatalogProductCard
                    priority={index === 0}
                    product={product}
                  />
                </Reveal>
              </li>
            ))}
          </ul>
          {products.length === 0 ? (
            <p className="mt-8 rounded-xl border border-smoke/30 bg-porcelain p-6 text-sm text-smoke">
              {/*
                An empty production catalog is stated plainly rather than filled
                with placeholders that could read as real stock.
              */}
              No products are published yet. The Diverso team can tell you what
              is currently in store.
            </p>
          ) : null}
        </Container>
      </section>

      {brands.length > 0 ? (
        <section className="content-auto bg-obsidian py-[4.5rem]" id="brands">
          <Container>
            <Reveal>
              <SectionHeading
                eyebrow="SHOP BY BRAND"
                inverse
                title="A quieter way to browse the names you know."
              />
            </Reveal>
            <div className="mt-7 flex snap-x gap-[18px] overflow-x-auto pb-4 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0">
              {brands.slice(0, 6).map((brand, index) => (
                <Reveal
                  className="flex flex-1"
                  delay={index * 70}
                  key={brand.id}
                >
                  <BrandTile brand={brand} />
                </Reveal>
              ))}
            </div>
            <Reveal>
              <Link
                className="mt-7 inline-flex min-h-11 items-center text-sm font-semibold text-orbit-gold hover:underline"
                href="/brands"
              >
                All brands →
              </Link>
            </Reveal>
          </Container>
        </section>
      ) : null}

      <section className="content-auto bg-porcelain py-20">
        <Container>
          <Reveal>
            <p className="text-sm font-semibold tracking-[0.08em]">
              LOCAL EXPERTISE · HUMAN ADVICE
            </p>
          </Reveal>
          <Reveal delay={90}>
            <h2 className="mt-5 max-w-[51rem] font-display text-[3.5rem] leading-[1.02] tracking-[-0.01em] sm:text-6xl">
              See the details online. Decide with confidence in store.
            </h2>
          </Reveal>
          <Reveal delay={180}>
            <p className="mt-7 max-w-[42.5rem] text-lg leading-8 text-smoke">
              Product pages lead with fit, use and verified specifications. For
              lens guidance, availability and delivery, speak directly with the
              Diverso team.
            </p>
          </Reveal>
        </Container>
      </section>

      <section className="content-auto bg-orbit-gold py-16" id="store">
        <Container>
          <Reveal>
            <p className="text-sm font-semibold tracking-[0.08em]">
              VISIT F-11 MARKAZ, ISLAMABAD
            </p>
            <h2 className="mt-4 max-w-[47.5rem] font-display text-[2.5rem] leading-[1.05] sm:text-5xl">
              Your shortlist, ready for a human conversation.
            </h2>
          </Reveal>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              asChild
              className="border border-obsidian bg-obsidian text-porcelain hover:bg-charcoal"
            >
              <a href={buildGeneralWhatsAppHref()}>
                Ask on WhatsApp · {whatsappDestination.display}
              </a>
            </Button>
            <Button asChild tone="quiet" className="border border-obsidian">
              <Link href="/store">F-11 store details</Link>
            </Button>
          </div>
        </Container>
      </section>
    </main>
  );
}
