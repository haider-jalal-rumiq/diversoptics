import type { Metadata } from "next";

import { EntityManager } from "@/components/cms/entity-manager";
import { PageHeading } from "@/components/cms/page-heading";
import { canEditCatalog, getCurrentStaff } from "@/features/cms/auth/staff";
import { getCmsEntities } from "@/features/cms/data/entities";

export const metadata: Metadata = { title: "Brands" };

export default async function BrandsPage() {
  const [entities, staff] = await Promise.all([
    getCmsEntities("brand"),
    getCurrentStaff(),
  ]);
  return (
    <>
      <PageHeading
        description="Maintain the verified brand directory without implying authorization or retailer status."
        title="Brands"
      />
      <EntityManager
        canEdit={Boolean(staff && canEditCatalog(staff.role))}
        entities={entities}
        kind="brand"
      />
    </>
  );
}
