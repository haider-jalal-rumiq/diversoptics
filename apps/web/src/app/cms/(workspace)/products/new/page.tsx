import type { Metadata } from "next";

import { PageHeading } from "@/components/cms/page-heading";
import { ProductForm } from "@/components/cms/product-form";
import { canEditCatalog, getCurrentStaff } from "@/features/cms/auth/staff";
import { getProductEditorData } from "@/features/cms/data/product-editor";

export const metadata: Metadata = { title: "Add product" };

export default async function NewProductPage() {
  const [editor, staff] = await Promise.all([
    getProductEditorData(),
    getCurrentStaff(),
  ]);

  return (
    <>
      <PageHeading
        description="Create a verified inventory draft. Media and publication controls become available after the first save."
        title="Add product"
      />
      <ProductForm
        brands={editor.brands}
        canEdit={Boolean(staff && canEditCatalog(staff.role))}
        categories={editor.categories}
        product={null}
      />
    </>
  );
}
