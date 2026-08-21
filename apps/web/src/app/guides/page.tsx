import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { SiteShell } from "@/components/site/site-shell";
import { Container } from "@/components/ui/container";
import { createCatalogRepository } from "@/features/catalog/data/catalog-repository";

export const metadata: Metadata = {
  alternates: { canonical: "/guides" },
  description:
    "Plain-language guides to frames, lenses, watches and writing instruments from Diverso Optics.",
  title: "Guides",
};

export default async function GuidesPage() {
  const guides = await createCatalogRepository().getPages("guide");

  return (
    <SiteShell>
      <main className="bg-porcelain py-8 sm:py-12" id="main">
        <Container>
          <Breadcrumbs
            trail={[
              { href: "/", label: "Home" },
              { href: "/guides", label: "Guides" },
            ]}
          />

          <h1 className="mt-5 font-display text-[2.75rem] leading-[1.05] tracking-[-0.01em] sm:text-5xl">
            Guides
          </h1>
          <p className="mt-4 max-w-prose text-base leading-7 text-smoke">
            {/*
              AGENTS.md rules out medical or vision claims, so these are framed
              as orientation for a conversation, not clinical advice.
            */}
            Plain-language orientation before you visit. Nothing here is
            prescription or medical advice — that conversation happens with the
            team in store.
          </p>

          {guides.length === 0 ? (
            <p className="mt-8 rounded-xl border border-smoke/30 bg-white p-6 text-sm text-smoke">
              No guides are published yet.
            </p>
          ) : (
            <ul className="mt-9 list-none space-y-3 p-0">
              {guides.map((guide) => (
                <li
                  className="rounded-xl border border-smoke/40 bg-white p-5"
                  key={guide.slug}
                >
                  <h2 className="text-xl font-semibold">
                    <Link
                      className="hover:underline"
                      href={guide.href as Route}
                    >
                      {guide.title}
                    </Link>
                  </h2>
                  {guide.excerpt ? (
                    <p className="mt-2 text-sm leading-6 text-smoke">
                      {guide.excerpt}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </Container>
      </main>
    </SiteShell>
  );
}
