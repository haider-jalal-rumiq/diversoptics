import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";

import { DemoCatalogNotice } from "@/components/catalog/demo-catalog-notice";
import { SiteShell } from "@/components/site/site-shell";
import { Container } from "@/components/ui/container";
import {
  createCatalogRepository,
  isDemoCatalog,
} from "@/features/catalog/data/catalog-repository";

export const metadata: Metadata = {
  alternates: { canonical: "/brands" },
  description:
    "Brands stocked by Diverso Optics in F-11 Markaz, Islamabad. Availability is confirmed by the store.",
  title: "Brands",
};

export default async function BrandsPage() {
  const brands = await createCatalogRepository().getBrands();

  return (
    <SiteShell>
      <main className="bg-porcelain py-8 sm:py-12" id="main">
        <Container className="sm:max-w-[70rem]">
          <DemoCatalogNotice active={isDemoCatalog()} />

          <h1 className="mt-5 font-display text-[2.75rem] leading-[1.05] tracking-[-0.01em] sm:text-5xl">
            Brands
          </h1>
          <p className="mt-4 max-w-prose text-base leading-7 text-smoke">
            {/*
              No authorised-dealer or authenticity claim is made here. AGENTS.md
              requires client-supplied proof before any such statement.
            */}
            Browse by the names Diverso Optics carries. Current stock, model
            availability and pricing are confirmed by the store.
          </p>

          {brands.length === 0 ? (
            <p className="mt-8 rounded-xl border border-smoke/30 bg-white p-6 text-sm text-smoke">
              No brands are published yet. The Diverso team can tell you what is
              currently in store.
            </p>
          ) : (
            <ul className="mt-9 grid list-none grid-cols-2 gap-4 p-0 sm:grid-cols-3 lg:grid-cols-4">
              {brands.map((brand) => (
                <li key={brand.id}>
                  <Link
                    className="flex min-h-36 flex-col items-center justify-center rounded-xl border border-smoke/40 bg-white px-4 py-6 text-center shadow-card hover:border-obsidian"
                    href={brand.href as Route}
                  >
                    <span className="text-base font-semibold uppercase">
                      {brand.name}
                    </span>
                    <span className="mt-2 text-xs text-smoke">
                      View products
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </main>
    </SiteShell>
  );
}
