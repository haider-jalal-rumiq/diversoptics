"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireCatalogEditor } from "@/features/cms/auth/staff";
import { createClient } from "@/lib/supabase/server";

const assignmentSchema = z.object({
  collectionId: z.coerce.number().int().positive(),
  productId: z.coerce.number().int().positive(),
  sortOrder: z.coerce.number().int().min(0).max(10_000),
});

export async function addCollectionProduct(formData: FormData) {
  await requireCatalogEditor();
  const parsed = assignmentSchema.safeParse({
    collectionId: formData.get("collectionId"),
    productId: formData.get("productId"),
    sortOrder: formData.get("sortOrder") || 0,
  });
  if (!parsed.success) throw new Error("The collection assignment is invalid.");

  const supabase = await createClient();
  const { error } = await supabase.from("collection_products").insert({
    collection_id: parsed.data.collectionId,
    product_id: parsed.data.productId,
    sort_order: parsed.data.sortOrder,
  });
  if (error && !error.message.includes("duplicate")) {
    throw new Error("The product could not be assigned.");
  }
  revalidatePath(`/cms/collections/${parsed.data.collectionId}`);
}

export async function removeCollectionProduct(
  collectionId: number,
  assignmentId: number,
) {
  await requireCatalogEditor();
  const supabase = await createClient();
  const { error } = await supabase
    .from("collection_products")
    .delete()
    .eq("id", assignmentId)
    .eq("collection_id", collectionId);
  if (error) throw new Error("The collection assignment could not be removed.");
  revalidatePath(`/cms/collections/${collectionId}`);
}
