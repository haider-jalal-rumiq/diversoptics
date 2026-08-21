import { createCatalogRepository } from "@/features/catalog/data/catalog-repository";

import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

/**
 * Wraps a public page with the header and footer, deriving primary navigation
 * from the published top-level categories so the menu follows the CMS instead of
 * a hard-coded list. An unpublished catalog falls back to the static links.
 */
export async function SiteShell({ children }: { children: React.ReactNode }) {
  const tree = await createCatalogRepository().getCategoryTree();
  const navigation = tree.map((category) => ({
    href: category.href,
    label: category.name,
  }));

  return (
    <>
      <SiteHeader navigation={navigation.length > 0 ? navigation : undefined} />
      {children}
      <SiteFooter />
    </>
  );
}
