import "server-only";

import { createClient } from "@/lib/supabase/server";

export type ProductEditorOption = {
  id: number;
  name: string;
  status: string;
};

export type ProductEditorRecord = {
  availability: string;
  brandId: number | null;
  categoryId: number;
  currency: string;
  description: string | null;
  eyebrow: string | null;
  featured: boolean;
  id: number;
  modelNumber: string;
  name: string;
  price: number | null;
  priceMode: string;
  primaryMediaReady: boolean;
  shortDescription: string | null;
  sku: string;
  slug: string;
  status: string;
  updatedAt: string;
};

export async function getProductEditorData(productId?: number) {
  const supabase = await createClient();
  const [categoriesResult, brandsResult, productResult] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, status")
      .neq("status", "archived")
      .order("sort_order")
      .order("name"),
    supabase
      .from("brands")
      .select("id, name, status")
      .neq("status", "archived")
      .order("sort_order")
      .order("name"),
    productId
      ? supabase
          .from("products")
          .select(
            "id, category_id, brand_id, name, slug, model_number, sku, eyebrow, short_description, description, price_mode, price, currency, availability, status, featured, updated_at, product_media(id, rights_status, public_path, is_primary, archived_at)",
          )
          .eq("id", productId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  const error =
    categoriesResult.error ?? brandsResult.error ?? productResult.error;

  if (error) {
    throw new Error(`Could not load the product editor: ${error.message}`);
  }

  const product = productResult.data;
  const editorProduct: ProductEditorRecord | null = product
    ? {
        availability: product.availability,
        brandId: product.brand_id,
        categoryId: product.category_id,
        currency: product.currency,
        description: product.description,
        eyebrow: product.eyebrow,
        featured: product.featured,
        id: product.id,
        modelNumber: product.model_number,
        name: product.name,
        price: product.price === null ? null : Number(product.price),
        priceMode: product.price_mode,
        primaryMediaReady: product.product_media.some(
          (media) =>
            media.is_primary &&
            media.rights_status === "approved" &&
            Boolean(media.public_path) &&
            media.archived_at === null,
        ),
        shortDescription: product.short_description,
        sku: product.sku,
        slug: product.slug,
        status: product.status,
        updatedAt: product.updated_at,
      }
    : null;

  return {
    brands: (brandsResult.data ?? []) as ProductEditorOption[],
    categories: (categoriesResult.data ?? []) as ProductEditorOption[],
    product: editorProduct,
  };
}
