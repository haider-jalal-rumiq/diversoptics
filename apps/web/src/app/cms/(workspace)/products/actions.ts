"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireCatalogEditor } from "@/features/cms/auth/staff";
import { productFormSchema } from "@/features/cms/domain/product-form";
import { createClient } from "@/lib/supabase/server";

export type ProductActionState = {
  fieldErrors?: Record<string, string | undefined>;
  message?: string;
};

export async function saveProduct(
  productId: number | null,
  _previousState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  await requireCatalogEditor();

  const parsed = productFormSchema.safeParse({
    availability: formData.get("availability"),
    brandId: formData.get("brandId") || null,
    categoryId: formData.get("categoryId"),
    currency: formData.get("currency"),
    description: formData.get("description"),
    eyebrow: formData.get("eyebrow"),
    featured: formData.get("featured") === "on",
    modelNumber: formData.get("modelNumber"),
    name: formData.get("name"),
    price: formData.get("price"),
    priceMode: formData.get("priceMode"),
    shortDescription: formData.get("shortDescription"),
    sku: formData.get("sku"),
    slug: formData.get("slug"),
    status: formData.get("status"),
    updatedAt: formData.get("updatedAt") || null,
  });

  if (!parsed.success) {
    const flattened = z.flattenError(parsed.error);
    return {
      fieldErrors: Object.fromEntries(
        Object.entries(flattened.fieldErrors).map(([field, errors]) => [
          field,
          errors?.[0],
        ]),
      ),
      message: "Fix the highlighted fields before saving.",
    };
  }

  const values = parsed.data;
  const payload = {
    archived_at: values.status === "archived" ? new Date().toISOString() : null,
    availability: values.availability,
    brand_id: values.brandId,
    category_id: values.categoryId,
    currency: values.currency,
    description: values.description,
    eyebrow: values.eyebrow,
    featured: values.featured,
    model_number: values.modelNumber,
    name: values.name,
    price: values.price,
    price_mode: values.priceMode,
    short_description: values.shortDescription,
    sku: values.sku,
    slug: values.slug,
    status: values.status,
  };
  const supabase = await createClient();

  if (productId === null) {
    if (values.status !== "draft") {
      return {
        fieldErrors: { status: "Create the draft before publishing." },
        message: "A new product must begin as a draft.",
      };
    }

    const { data, error } = await supabase
      .from("products")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      return { message: mapProductMutationError(error.message) };
    }

    revalidatePath("/cms");
    revalidatePath("/cms/products");
    redirect(`/cms/products/${data.id}`);
  }

  if (!values.updatedAt) {
    return { message: "Refresh this product before editing it." };
  }

  const { data, error } = await supabase
    .from("products")
    .update(payload)
    .eq("id", productId)
    .eq("updated_at", values.updatedAt)
    .select("id")
    .maybeSingle();

  if (error) {
    return { message: mapProductMutationError(error.message) };
  }

  if (!data) {
    return {
      message:
        "This product changed in another session. Refresh before overwriting it.",
    };
  }

  revalidatePath("/cms");
  revalidatePath("/cms/products");
  revalidatePath(`/cms/products/${productId}`);

  return { message: "Saved successfully." };
}

function mapProductMutationError(message: string) {
  if (message.includes("products_slug_key")) {
    return "That product URL slug is already in use.";
  }

  if (message.includes("products_sku_key")) {
    return "That SKU is already in use.";
  }

  if (message.includes("primary media")) {
    return "Add an approved primary image before publishing.";
  }

  if (message.includes("published category")) {
    return "Publish the selected category before publishing this product.";
  }

  if (message.includes("published brand")) {
    return "Publish the selected brand before publishing this product.";
  }

  if (message.includes("required attributes")) {
    return "Complete every required category attribute before publishing.";
  }

  return "The product could not be saved. Review its fields and try again.";
}
