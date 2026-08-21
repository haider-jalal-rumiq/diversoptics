import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database.types";

export type CmsAttributeDefinition = {
  archived: boolean;
  categoryId: number;
  id: number;
  isFilterable: boolean;
  isRequired: boolean;
  key: string;
  name: string;
  options: string[];
  sortOrder: number;
  updatedAt: string;
  valueType: string;
};

function stringOptions(value: Json): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export async function getCategoryAttributes(categoryId: number) {
  const supabase = await createClient();
  const [categoryResult, definitionsResult] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name")
      .eq("id", categoryId)
      .maybeSingle(),
    supabase
      .from("attribute_definitions")
      .select(
        "id, category_id, name, key, value_type, options, is_required, is_filterable, sort_order, archived_at, updated_at",
      )
      .eq("category_id", categoryId)
      .order("sort_order")
      .order("name"),
  ]);
  const error = categoryResult.error ?? definitionsResult.error;
  if (error)
    throw new Error(`Could not load category attributes: ${error.message}`);

  return {
    category: categoryResult.data,
    definitions: (definitionsResult.data ?? []).map(mapDefinition),
  };
}

export async function getProductAttributeEditor(
  productId: number,
  categoryId: number,
) {
  const supabase = await createClient();
  const [definitionsResult, valuesResult] = await Promise.all([
    supabase
      .from("attribute_definitions")
      .select(
        "id, category_id, name, key, value_type, options, is_required, is_filterable, sort_order, archived_at, updated_at",
      )
      .eq("category_id", categoryId)
      .is("archived_at", null)
      .order("sort_order"),
    supabase
      .from("product_attribute_values")
      .select(
        "attribute_definition_id, value_text, value_number, value_boolean, value_json",
      )
      .eq("product_id", productId)
      .is("variant_id", null),
  ]);
  const error = definitionsResult.error ?? valuesResult.error;
  if (error)
    throw new Error(`Could not load product attributes: ${error.message}`);

  return {
    definitions: (definitionsResult.data ?? []).map(mapDefinition),
    values: valuesResult.data ?? [],
  };
}

function mapDefinition(definition: {
  archived_at: string | null;
  category_id: number;
  id: number;
  is_filterable: boolean;
  is_required: boolean;
  key: string;
  name: string;
  options: Json;
  sort_order: number;
  updated_at: string;
  value_type: string;
}): CmsAttributeDefinition {
  return {
    archived: definition.archived_at !== null,
    categoryId: definition.category_id,
    id: definition.id,
    isFilterable: definition.is_filterable,
    isRequired: definition.is_required,
    key: definition.key,
    name: definition.name,
    options: stringOptions(definition.options),
    sortOrder: definition.sort_order,
    updatedAt: definition.updated_at,
    valueType: definition.value_type,
  };
}
