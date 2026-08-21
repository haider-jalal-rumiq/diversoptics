"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireCatalogEditor } from "@/features/cms/auth/staff";
import { createClient } from "@/lib/supabase/server";

const pageSchema = z.object({
  bodyMarkdown: z.string().trim().max(100_000),
  excerpt: z
    .string()
    .trim()
    .max(320)
    .transform((value) => value || null),
  kind: z.enum(["guide", "policy", "page"]),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(140),
  status: z.enum(["draft", "published", "archived"]),
  title: z.string().trim().min(2).max(180),
  updatedAt: z.iso.datetime().nullable(),
});

export type PageActionState = { message?: string; success?: boolean };

export async function savePage(
  pageId: number | null,
  _previousState: PageActionState,
  formData: FormData,
): Promise<PageActionState> {
  await requireCatalogEditor();
  const parsed = pageSchema.safeParse({
    bodyMarkdown: formData.get("bodyMarkdown"),
    excerpt: formData.get("excerpt"),
    kind: formData.get("kind"),
    slug: formData.get("slug"),
    status: formData.get("status"),
    title: formData.get("title"),
    updatedAt: formData.get("updatedAt") || null,
  });

  if (!parsed.success)
    return { message: "Review the title, slug, kind, and content." };

  const values = parsed.data;
  const payload = {
    archived_at: values.status === "archived" ? new Date().toISOString() : null,
    body_markdown: values.bodyMarkdown,
    excerpt: values.excerpt,
    kind: values.kind,
    slug: values.slug,
    status: values.status,
    title: values.title,
  };
  const supabase = await createClient();
  const result = pageId
    ? await supabase
        .from("pages")
        .update(payload)
        .eq("id", pageId)
        .eq("updated_at", values.updatedAt ?? "")
        .select("id")
        .maybeSingle()
    : await supabase.from("pages").insert(payload).select("id").single();

  if (result.error) {
    return {
      message: result.error.message.includes("slug")
        ? "That page slug is already in use."
        : "The page could not be saved.",
    };
  }
  if (!result.data)
    return { message: "This page changed elsewhere. Refresh first." };

  revalidatePath("/cms/pages");
  return { message: "Page saved.", success: true };
}
