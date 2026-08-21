"use server";

import { revalidatePath } from "next/cache";

import { requireCatalogEditor } from "@/features/cms/auth/staff";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database.types";

export type ProductAttributesState = { message?: string; success?: boolean };

export async function saveProductAttributes(
  productId: number,
  _previousState: ProductAttributesState,
  formData: FormData,
): Promise<ProductAttributesState> {
  await requireCatalogEditor();
  const supabase = await createClient();
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("category_id")
    .eq("id", productId)
    .maybeSingle();
  if (productError || !product)
    return { message: "The product could not be verified." };

  const { data: definitions, error: definitionsError } = await supabase
    .from("attribute_definitions")
    .select("id, name, value_type, options, is_required")
    .eq("category_id", product.category_id)
    .is("archived_at", null)
    .order("sort_order");
  if (definitionsError)
    return { message: "Attribute definitions could not be verified." };

  const values: Json[] = [];
  for (const definition of definitions ?? []) {
    const raw = String(formData.get(`attribute_${definition.id}`) ?? "").trim();
    if (!raw) {
      if (definition.is_required)
        return { message: `${definition.name} is required.` };
      continue;
    }

    const item: Record<string, Json> = {
      attribute_definition_id: definition.id,
      value_boolean: null,
      value_json: null,
      value_number: null,
      value_text: null,
    };
    const options = Array.isArray(definition.options)
      ? definition.options.filter(
          (option): option is string => typeof option === "string",
        )
      : [];

    if (definition.value_type === "number") {
      const number = Number(raw);
      if (!Number.isFinite(number))
        return { message: `${definition.name} must be a number.` };
      item.value_number = number;
    } else if (definition.value_type === "boolean") {
      if (raw !== "true" && raw !== "false")
        return { message: `${definition.name} must be Yes or No.` };
      item.value_boolean = raw === "true";
    } else if (definition.value_type === "option") {
      if (!options.includes(raw))
        return { message: `${definition.name} has an invalid option.` };
      item.value_text = raw;
    } else if (definition.value_type === "multi_option") {
      const selected = [
        ...new Set(
          raw
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
        ),
      ];
      if (
        !selected.length ||
        selected.some((value) => !options.includes(value))
      ) {
        return { message: `${definition.name} has invalid options.` };
      }
      item.value_json = selected;
    } else {
      item.value_text = raw.slice(0, 1_000);
    }
    values.push(item);
  }

  const { error } = await supabase.rpc("save_product_attribute_values", {
    p_product_id: productId,
    p_values: values,
  });
  if (error)
    return { message: "The structured attributes could not be saved." };

  revalidatePath(`/cms/products/${productId}`);
  return { message: "Attributes saved.", success: true };
}
