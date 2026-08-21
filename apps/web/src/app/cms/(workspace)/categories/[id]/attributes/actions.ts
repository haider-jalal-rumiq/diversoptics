"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireCatalogEditor } from "@/features/cms/auth/staff";
import { createClient } from "@/lib/supabase/server";

const definitionSchema = z.object({
  archived: z.boolean(),
  isFilterable: z.boolean(),
  isRequired: z.boolean(),
  key: z
    .string()
    .trim()
    .regex(/^[a-z][a-z0-9_]*$/)
    .max(80),
  name: z.string().trim().min(2).max(100),
  options: z.string().transform((value) => [
    ...new Set(
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ]),
  sortOrder: z.coerce.number().int().min(0).max(10_000),
  updatedAt: z.iso.datetime().nullable(),
  valueType: z.enum(["text", "number", "boolean", "option", "multi_option"]),
});

export type AttributeActionState = { message?: string; success?: boolean };

export async function saveAttributeDefinition(
  categoryId: number,
  definitionId: number | null,
  _previousState: AttributeActionState,
  formData: FormData,
): Promise<AttributeActionState> {
  await requireCatalogEditor();
  const parsed = definitionSchema.safeParse({
    archived: formData.get("archived") === "on",
    isFilterable: formData.get("isFilterable") === "on",
    isRequired: formData.get("isRequired") === "on",
    key: formData.get("key"),
    name: formData.get("name"),
    options: formData.get("options") ?? "",
    sortOrder: formData.get("sortOrder") || 0,
    updatedAt: formData.get("updatedAt") || null,
    valueType: formData.get("valueType"),
  });
  if (!parsed.success)
    return { message: "Review the definition name, key, type, and options." };

  const values = parsed.data;
  if (
    (values.valueType === "option" || values.valueType === "multi_option") &&
    !values.options.length
  ) {
    return {
      message: "Option attributes need at least one comma-separated option.",
    };
  }
  const payload = {
    archived_at: values.archived ? new Date().toISOString() : null,
    category_id: categoryId,
    is_filterable: values.isFilterable,
    is_required: values.isRequired,
    key: values.key,
    name: values.name,
    options: values.options,
    sort_order: values.sortOrder,
    value_type: values.valueType,
  };
  const supabase = await createClient();
  const result = definitionId
    ? await supabase
        .from("attribute_definitions")
        .update(payload)
        .eq("id", definitionId)
        .eq("category_id", categoryId)
        .eq("updated_at", values.updatedAt ?? "")
        .select("id")
        .maybeSingle()
    : await supabase
        .from("attribute_definitions")
        .insert(payload)
        .select("id")
        .single();
  if (result.error) {
    return {
      message: result.error.message.includes("key")
        ? "That category key already exists."
        : "The definition could not be saved.",
    };
  }
  if (!result.data)
    return { message: "This definition changed elsewhere. Refresh first." };

  revalidatePath(`/cms/categories/${categoryId}/attributes`);
  return { message: "Attribute definition saved.", success: true };
}
