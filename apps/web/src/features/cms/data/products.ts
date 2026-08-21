import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const productListSchema = z.object({
  q: z
    .string()
    .trim()
    .max(80)
    .transform((value) => value.replace(/[^\p{L}\p{N}\s-]/gu, ""))
    .optional(),
  status: z.enum(["all", "draft", "published", "archived"]).default("all"),
});

export type ProductListInput = { q?: unknown; status?: unknown };

export type CmsProductRow = {
  availability: string;
  brandName: string | null;
  categoryName: string;
  id: number;
  modelNumber: string;
  name: string;
  priceMode: string;
  sku: string;
  slug: string;
  status: string;
  updatedAt: string;
};

export async function getCmsProducts(input: ProductListInput): Promise<{
  filters: z.output<typeof productListSchema>;
  products: CmsProductRow[];
}> {
  const filters = productListSchema.catch({ status: "all" }).parse(input);
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select(
      "id, name, slug, model_number, sku, status, availability, price_mode, updated_at, brands(name), categories(name)",
    )
    .order("updated_at", { ascending: false })
    .limit(50);

  if (filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters.q) {
    query = query.or(
      `name.ilike.%${filters.q}%,sku.ilike.%${filters.q}%,model_number.ilike.%${filters.q}%`,
    );
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Could not load products: ${error.message}`);
  }

  return {
    filters,
    products: (data ?? []).map((product) => ({
      availability: product.availability,
      brandName: product.brands?.name ?? null,
      categoryName: product.categories.name,
      id: product.id,
      modelNumber: product.model_number,
      name: product.name,
      priceMode: product.price_mode,
      sku: product.sku,
      slug: product.slug,
      status: product.status,
      updatedAt: product.updated_at,
    })),
  };
}
import "server-only";
