import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeading } from "@/components/cms/page-heading";
import { ProductForm } from "@/components/cms/product-form";
import { ProductAttributesForm } from "@/components/cms/product-attributes-form";
import { VariantManager } from "@/components/cms/variant-manager";
import { Button } from "@/components/ui/button";
import { canEditCatalog, getCurrentStaff } from "@/features/cms/auth/staff";
import { getProductEditorData } from "@/features/cms/data/product-editor";
import { getProductVariants } from "@/features/cms/data/variants";
import { getProductAttributeEditor } from "@/features/cms/data/attributes";

export const metadata: Metadata = { title: "Edit product" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);

  if (!Number.isSafeInteger(productId) || productId <= 0) {
    notFound();
  }

  const editor = await getProductEditorData(productId);

  if (!editor.product) {
    notFound();
  }

  const [staff, variants, attributes] = await Promise.all([
    getCurrentStaff(),
    getProductVariants(productId),
    getProductAttributeEditor(productId, editor.product.categoryId),
  ]);

  return (
    <>
      <PageHeading
        action={
          <div className="flex flex-wrap gap-2">
            <Button asChild tone="quiet">
              <Link href={`/cms/products/${productId}/preview`}>Preview</Link>
            </Button>
            <Button asChild tone="quiet">
              <Link href={`/cms/products/${productId}/media`}>
                Manage media
              </Link>
            </Button>
          </div>
        }
        description="Changes use optimistic concurrency, so a stale browser tab cannot silently overwrite newer catalog work."
        title={editor.product.name}
      />
      <ProductForm
        brands={editor.brands}
        canEdit={Boolean(staff && canEditCatalog(staff.role))}
        categories={editor.categories}
        product={editor.product}
      />
      <VariantManager
        canEdit={Boolean(staff && canEditCatalog(staff.role))}
        productId={productId}
        variants={variants}
      />
      <ProductAttributesForm
        canEdit={Boolean(staff && canEditCatalog(staff.role))}
        definitions={attributes.definitions}
        productId={productId}
        values={attributes.values}
      />
    </>
  );
}
