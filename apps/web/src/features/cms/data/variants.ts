import "server-only";

import { createClient } from "@/lib/supabase/server";

export type CmsVariant = {
  availability: string;
  id: number;
  name: string;
  price: number | null;
  priceMode: string | null;
  sku: string;
  sortOrder: number;
  status: string;
  updatedAt: string;
};

export async function getProductVariants(
  productId: number,
): Promise<CmsVariant[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_variants")
    .select(
      "id, name, sku, price_mode, price, availability, status, sort_order, updated_at",
    )
    .eq("product_id", productId)
    .order("sort_order")
    .order("name");

  if (error)
    throw new Error(`Could not load product variants: ${error.message}`);

  return (data ?? []).map((variant) => ({
    availability: variant.availability,
    id: variant.id,
    name: variant.name,
    price: variant.price === null ? null : Number(variant.price),
    priceMode: variant.price_mode,
    sku: variant.sku,
    sortOrder: variant.sort_order,
    status: variant.status,
    updatedAt: variant.updated_at,
  }));
}
