import "server-only";

import { createClient } from "@/lib/supabase/server";

export async function getCollectionEditor(collectionId: number) {
  const supabase = await createClient();
  const [collectionResult, assignmentsResult, productsResult] =
    await Promise.all([
      supabase
        .from("collections")
        .select("id, name, status")
        .eq("id", collectionId)
        .maybeSingle(),
      supabase
        .from("collection_products")
        .select("id, product_id, sort_order, products(id, name, sku, status)")
        .eq("collection_id", collectionId)
        .order("sort_order"),
      supabase
        .from("products")
        .select("id, name, sku, status")
        .neq("status", "archived")
        .order("name")
        .limit(250),
    ]);
  const error =
    collectionResult.error ?? assignmentsResult.error ?? productsResult.error;
  if (error)
    throw new Error(`Could not load the collection editor: ${error.message}`);

  return {
    assignments: assignmentsResult.data ?? [],
    collection: collectionResult.data,
    products: productsResult.data ?? [],
  };
}
