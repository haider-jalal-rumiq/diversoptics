import type { Metadata } from "next";

import { EntityManager } from "@/components/cms/entity-manager";
import { PageHeading } from "@/components/cms/page-heading";
import { canEditCatalog, getCurrentStaff } from "@/features/cms/auth/staff";
import { getCmsEntities } from "@/features/cms/data/entities";

export const metadata: Metadata = { title: "Collections" };

export default async function CollectionsPage() {
  const [entities, staff] = await Promise.all([
    getCmsEntities("collection"),
    getCurrentStaff(),
  ]);
  return (
    <>
      <PageHeading
        description="Create editorial groups for confirmed products. Product assignment follows after inventory entry."
        title="Collections"
      />
      <EntityManager
        canEdit={Boolean(staff && canEditCatalog(staff.role))}
        entities={entities}
        kind="collection"
      />
    </>
  );
}
