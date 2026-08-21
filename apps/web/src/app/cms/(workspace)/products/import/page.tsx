import type { Metadata } from "next";

import { CsvImportForm } from "@/components/cms/csv-import-form";
import { PageHeading } from "@/components/cms/page-heading";
import { canEditCatalog, getCurrentStaff } from "@/features/cms/auth/staff";

export const metadata: Metadata = { title: "Import product drafts" };

export default async function ProductImportPage() {
  const staff = await getCurrentStaff();
  const canEdit = Boolean(staff && canEditCatalog(staff.role));
  return (
    <>
      <PageHeading
        description="Validate up to 500 inventory rows and insert them atomically as drafts. An error imports nothing."
        title="CSV draft import"
      />
      <section className="mt-7 rounded-card border border-smoke/15 bg-white p-6 shadow-card">
        <h2 className="font-display text-3xl">Required format</h2>
        <p className="mt-3 text-sm leading-6 text-smoke">
          Required headers: <code>category_slug</code>, <code>name</code>,{" "}
          <code>slug</code>, <code>model_number</code>, and <code>sku</code>.
          Optional headers include <code>brand_slug</code>,{" "}
          <code>price_mode</code>, <code>price</code>, <code>availability</code>
          , <code>eyebrow</code>, <code>short_description</code>, and{" "}
          <code>description</code>.
        </p>
        <p className="mt-3 text-sm leading-6 text-smoke">
          Category and brand slugs must already exist. Every imported item
          remains a draft and still needs real media review before publishing.
        </p>
        {canEdit ? (
          <CsvImportForm />
        ) : (
          <p className="mt-5 text-sm text-signal-red">
            Viewer accounts cannot import products.
          </p>
        )}
      </section>
    </>
  );
}
