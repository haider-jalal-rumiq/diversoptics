import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { SiteShell } from "@/components/site/site-shell";
import { Container } from "@/components/ui/container";
import { createCatalogRepository } from "@/features/catalog/data/catalog-repository";

/**
 * This page is prerendered, and its content comes from the CMS. Without a
 * revalidation window it would be baked at deploy time and never reflect a
 * policy the owner publishes later, until someone redeployed. Sixty seconds
 * keeps CMS edits visible quickly at negligible cost for this traffic level.
 */
export const revalidate = 60;

export const metadata: Metadata = {
  alternates: { canonical: "/policies" },
  description:
    "Store, warranty and service policies for Diverso Optics in F-11 Markaz, Islamabad.",
  title: "Policies",
};

export default async function PoliciesPage() {
  const policies = await createCatalogRepository().getPages("policy");

  return (
    <SiteShell>
      <main className="bg-porcelain py-8 sm:py-12" id="main">
        <Container>
          <Breadcrumbs
            trail={[
              { href: "/", label: "Home" },
              { href: "/policies", label: "Policies" },
            ]}
          />

          <h1 className="mt-5 font-display text-[2.75rem] leading-[1.05] tracking-[-0.01em] sm:text-5xl">
            Policies
          </h1>
          <p className="mt-4 max-w-prose text-base leading-7 text-smoke">
            Warranty, exchange and service terms confirmed by the store.
          </p>

          {policies.length === 0 ? (
            <p className="mt-8 rounded-xl border border-smoke/30 bg-white p-6 text-sm text-smoke">
              No policies are published yet.
            </p>
          ) : (
            <ul className="mt-9 list-none space-y-3 p-0">
              {policies.map((policy) => (
                <li
                  className="rounded-xl border border-smoke/40 bg-white p-5"
                  key={policy.slug}
                >
                  <h2 className="text-xl font-semibold">
                    <Link
                      className="hover:underline"
                      href={policy.href as Route}
                    >
                      {policy.title}
                    </Link>
                  </h2>
                  {policy.excerpt ? (
                    <p className="mt-2 text-sm leading-6 text-smoke">
                      {policy.excerpt}
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
