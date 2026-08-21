"use server";

import { revalidatePath } from "next/cache";

import { requireCatalogEditor } from "@/features/cms/auth/staff";
import { variantFormSchema } from "@/features/cms/domain/variant-form";
import { createClient } from "@/lib/supabase/server";

export type VariantActionState = { message?: string; success?: boolean };

export async function saveVariant(
  productId: number,
  variantId: number | null,
  _previousState: VariantActionState,
  formData: FormData,
): Promise<VariantActionState> {
  await requireCatalogEditor();
  const parsed = variantFormSchema.safeParse({
    availability: formData.get("availability"),
    name: formData.get("name"),
    price: formData.get("price"),
    priceMode: formData.get("priceMode"),
    sku: formData.get("sku"),
    sortOrder: formData.get("sortOrder") || 0,
    status: formData.get("status"),
    updatedAt: formData.get("updatedAt") || null,
  });

  if (!parsed.success) {
    return {
      message: parsed.error.issues[0]?.message ?? "Review the variant fields.",
    };
  }

  const values = parsed.data;
  const payload = {
    archived_at: values.status === "archived" ? new Date().toISOString() : null,
    availability: values.availability,
    name: values.name,
    price: values.price,
    price_mode: values.priceMode,
    product_id: productId,
    sku: values.sku,
    sort_order: values.sortOrder,
    status: values.status,
  };
  const supabase = await createClient();
  const result = variantId
    ? await supabase
        .from("product_variants")
        .update(payload)
        .eq("id", variantId)
        .eq("product_id", productId)
        .eq("updated_at", values.updatedAt ?? "")
        .select("id")
        .maybeSingle()
    : await supabase
        .from("product_variants")
        .insert(payload)
        .select("id")
        .single();

  if (result.error) {
    return {
      message: result.error.message.includes("sku")
        ? "That variant SKU is already in use."
        : "The variant could not be saved.",
    };
  }
  if (!result.data)
    return { message: "This variant changed elsewhere. Refresh first." };

  revalidatePath(`/cms/products/${productId}`);
  return { message: "Variant saved.", success: true };
}
