import { createCatalogRepository } from "@/features/catalog/data/catalog-repository";

import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

/**
 * Wraps a public page with the curated header, atmospheric background, and the
 * CMS-derived footer links. The fixed header taxonomy reflects the client's
 * shopping priorities; the footer continues to follow published categories.
 */
export async function SiteShell({ children }: { children: React.ReactNode }) {
  const tree = await createCatalogRepository().getCategoryTree();
  const navigation = tree.map((category) => ({
    href: category.href,
    label: category.name,
  }));

  return (
    <div className="dx-public-shell">
      <div aria-hidden="true" className="dx-site-atmosphere" />
      <SiteHeader />
      {children}
      <SiteFooter navigation={navigation.length > 0 ? navigation : undefined} />
    </div>
  );
}
