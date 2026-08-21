import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  addCollectionProduct,
  removeCollectionProduct,
} from "@/app/cms/(workspace)/collections/[id]/actions";
import { PageHeading } from "@/components/cms/page-heading";
import { StatusBadge } from "@/components/cms/status-badge";
import { Button } from "@/components/ui/button";
import { canEditCatalog, getCurrentStaff } from "@/features/cms/auth/staff";
import { getCollectionEditor } from "@/features/cms/data/collection-editor";

export const metadata: Metadata = { title: "Collection products" };

export default async function CollectionProductsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const collectionId = Number(id);
  if (!Number.isSafeInteger(collectionId) || collectionId <= 0) notFound();

  const [editor, staff] = await Promise.all([
    getCollectionEditor(collectionId),
    getCurrentStaff(),
  ]);
  if (!editor.collection) notFound();
  const canEdit = Boolean(staff && canEditCatalog(staff.role));
  const assignedIds = new Set(
    editor.assignments.map((assignment) => assignment.product_id),
  );
  const availableProducts = editor.products.filter(
    (product) => !assignedIds.has(product.id),
  );

  return (
    <>
      <PageHeading
        description="Build an editorial sequence from verified catalog products. Draft products can be arranged here but remain hidden publicly."
        eyebrow="Collection editor"
        title={editor.collection.name}
      />

      {canEdit ? (
        <form
          action={addCollectionProduct}
          className="mt-7 grid gap-3 rounded-card border border-smoke/15 bg-white p-5 shadow-card sm:grid-cols-[1fr_10rem_auto]"
        >
          <input name="collectionId" type="hidden" value={collectionId} />
          <label className="sr-only" htmlFor="productId">
            Product
          </label>
          <select
            className="min-h-11 rounded-xl border border-smoke/30 bg-white px-4 text-sm"
            id="productId"
            name="productId"
            required
          >
            <option value="">Select a product</option>
            {availableProducts.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} · {product.sku} ({product.status})
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor="sortOrder">
            Sort order
          </label>
          <input
            className="min-h-11 rounded-xl border border-smoke/30 px-4 text-sm"
            defaultValue="0"
            id="sortOrder"
            min="0"
            name="sortOrder"
            type="number"
          />
          <Button
            className="rounded-xl"
            disabled={!availableProducts.length}
            type="submit"
          >
            Assign
          </Button>
        </form>
      ) : null}

      <div className="mt-5 overflow-hidden rounded-card border border-smoke/15 bg-white shadow-card">
        {editor.assignments.length ? (
          <ul className="divide-y divide-smoke/15">
            {editor.assignments.map((assignment, index) => (
              <li
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                key={assignment.id}
              >
                <div>
                  <span className="mr-3 text-sm text-smoke">{index + 1}</span>
                  <strong>{assignment.products.name}</strong>
                  <span className="ml-2 text-xs text-smoke">
                    {assignment.products.sku}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge value={assignment.products.status} />
                  {canEdit ? (
                    <form
                      action={removeCollectionProduct.bind(
                        null,
                        collectionId,
                        assignment.id,
                      )}
                    >
                      <Button
                        className="px-4 text-signal-red"
                        tone="quiet"
                        type="submit"
                      >
                        Remove
                      </Button>
                    </form>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-10 text-center text-sm text-smoke">
            This collection has no products yet.
          </p>
        )}
      </div>
    </>
  );
}
