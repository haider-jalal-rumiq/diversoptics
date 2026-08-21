import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { MarkdownContent } from "@/components/content/markdown-content";
import { SiteShell } from "@/components/site/site-shell";
import { Container } from "@/components/ui/container";
import { createCatalogRepository } from "@/features/catalog/data/catalog-repository";
import type { EditorialPage } from "@/features/catalog/domain/types";

async function loadGuide(slug: string): Promise<EditorialPage> {
  const page = await createCatalogRepository().getPageBySlug(slug);

  // A policy slug must not resolve under /guides, so the kind is checked too.
  if (!page || page.kind !== "guide") notFound();

  return page;
}

export async function generateMetadata(
  props: PageProps<"/guides/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const page = await loadGuide(slug);

  return {
    alternates: { canonical: page.href },
    ...(page.excerpt ? { description: page.excerpt } : {}),
    title: page.title,
  };
}

export default async function GuidePage(props: PageProps<"/guides/[slug]">) {
  const { slug } = await props.params;
  const page = await loadGuide(slug);

  return (
    <SiteShell>
      <main className="bg-porcelain py-8 sm:py-12" id="main">
        <Container>
          <Breadcrumbs
            trail={[
              { href: "/", label: "Home" },
              { href: "/guides", label: "Guides" },
              { href: page.href, label: page.title },
            ]}
          />

          <article className="mt-5">
            <h1 className="font-display text-[2.75rem] leading-[1.05] tracking-[-0.01em] sm:text-5xl">
              {page.title}
            </h1>
            {page.excerpt ? (
              <p className="mt-4 max-w-prose text-base leading-7 text-smoke">
                {page.excerpt}
              </p>
            ) : null}
            <div className="mt-6">
              <MarkdownContent source={page.bodyMarkdown} />
            </div>
          </article>
        </Container>
      </main>
    </SiteShell>
  );
}
