import type { Metadata } from "next";

import { EntityManager } from "@/components/cms/entity-manager";
import { PageHeading } from "@/components/cms/page-heading";
import { canEditCatalog, getCurrentStaff } from "@/features/cms/auth/staff";
import { getCmsEntities } from "@/features/cms/data/entities";

export const metadata: Metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const [entities, staff] = await Promise.all([
    getCmsEntities("category"),
    getCurrentStaff(),
  ]);
  return (
    <>
      <PageHeading
        description="Organize sunglasses, optical frames, contact lenses, watches, and writing instruments for clear browsing."
        title="Categories"
      />
      <EntityManager
        canEdit={Boolean(staff && canEditCatalog(staff.role))}
        entities={entities}
        kind="category"
      />
    </>
  );
}
