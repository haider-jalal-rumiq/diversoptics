"use server";

import { revalidatePath } from "next/cache";
import { requireCatalogEditor } from "@/features/cms/auth/staff";
import {
  entityFormSchema,
  entityKindSchema,
} from "@/features/cms/domain/entity-form";
import { createClient } from "@/lib/supabase/server";

export type EntityActionState = { message?: string; success?: boolean };

export async function saveEntity(
  kindInput: string,
  entityId: number | null,
  _previousState: EntityActionState,
  formData: FormData,
): Promise<EntityActionState> {
  await requireCatalogEditor();
  const kind = entityKindSchema.safeParse(kindInput);
  const parsed = entityFormSchema.safeParse({
    description: formData.get("description"),
    eyebrow: formData.get("eyebrow"),
    featured: formData.get("featured") === "on",
    name: formData.get("name"),
    slug: formData.get("slug"),
    sortOrder: formData.get("sortOrder") || 0,
    status: formData.get("status"),
    updatedAt: formData.get("updatedAt") || null,
  });

  if (!kind.success || !parsed.success) {
    return { message: "Review the name, slug, status, and ordering fields." };
  }

  const values = parsed.data;
  const common = {
    archived_at: values.status === "archived" ? new Date().toISOString() : null,
    description: values.description,
    featured: values.featured,
    name: values.name,
    slug: values.slug,
    sort_order: values.sortOrder,
    status: values.status,
  };
  const supabase = await createClient();
  let result: {
    data: { id: number } | null;
    error: { message: string } | null;
  };

  if (kind.data === "brand") {
    result = entityId
      ? await supabase
          .from("brands")
          .update(common)
          .eq("id", entityId)
          .eq("updated_at", values.updatedAt ?? "")
          .select("id")
          .maybeSingle()
      : await supabase.from("brands").insert(common).select("id").single();
  } else if (kind.data === "category") {
    const payload = { ...common, eyebrow: values.eyebrow };
    result = entityId
      ? await supabase
          .from("categories")
          .update(payload)
          .eq("id", entityId)
          .eq("updated_at", values.updatedAt ?? "")
          .select("id")
          .maybeSingle()
      : await supabase.from("categories").insert(payload).select("id").single();
  } else {
    const payload = {
      archived_at: common.archived_at,
      description: common.description,
      eyebrow: values.eyebrow,
      featured: common.featured,
      name: common.name,
      slug: common.slug,
      status: common.status,
    };
    result = entityId
      ? await supabase
          .from("collections")
          .update(payload)
          .eq("id", entityId)
          .eq("updated_at", values.updatedAt ?? "")
          .select("id")
          .maybeSingle()
      : await supabase
          .from("collections")
          .insert(payload)
          .select("id")
          .single();
  }

  if (result.error) {
    return {
      message: result.error.message.includes("slug")
        ? "That URL slug is already in use."
        : "The entry could not be saved.",
    };
  }

  if (!result.data) {
    return { message: "This entry changed elsewhere. Refresh before saving." };
  }

  const route = `${kind.data === "category" ? "categories" : `${kind.data}s`}`;
  revalidatePath(`/cms/${route}`);
  revalidatePath("/cms");
  return { message: "Saved successfully.", success: true };
}
