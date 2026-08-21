import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AttributeDefinitionManager } from "@/components/cms/attribute-definition-manager";
import { PageHeading } from "@/components/cms/page-heading";
import { canEditCatalog, getCurrentStaff } from "@/features/cms/auth/staff";
import { getCategoryAttributes } from "@/features/cms/data/attributes";

export const metadata: Metadata = { title: "Category attributes" };

export default async function CategoryAttributesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const categoryId = Number(id);
  if (!Number.isSafeInteger(categoryId) || categoryId <= 0) notFound();
  const [data, staff] = await Promise.all([
    getCategoryAttributes(categoryId),
    getCurrentStaff(),
  ]);
  if (!data.category) notFound();
  return (
    <>
      <PageHeading
        description="Define consistent, category-specific specifications and decide which verified fields can become public filters."
        eyebrow="Category attributes"
        title={data.category.name}
      />
      <AttributeDefinitionManager
        canEdit={Boolean(staff && canEditCatalog(staff.role))}
        categoryId={categoryId}
        definitions={data.definitions}
      />
    </>
  );
}
