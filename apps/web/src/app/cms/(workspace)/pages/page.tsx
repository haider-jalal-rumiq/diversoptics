import type { Metadata } from "next";

import { PageHeading } from "@/components/cms/page-heading";
import { PageManager } from "@/components/cms/page-manager";
import { canEditCatalog, getCurrentStaff } from "@/features/cms/auth/staff";
import { getCmsPages } from "@/features/cms/data/pages";

export const metadata: Metadata = { title: "Pages" };

export default async function CmsPagesPage() {
  const [pages, staff] = await Promise.all([getCmsPages(), getCurrentStaff()]);
  return (
    <>
      <PageHeading
        description="Draft and publish guides, policies, and supporting content without introducing unverified claims."
        title="Editorial pages"
      />
      <PageManager
        canEdit={Boolean(staff && canEditCatalog(staff.role))}
        pages={pages}
      />
    </>
  );
}
