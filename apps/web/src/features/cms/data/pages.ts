import "server-only";

import { createClient } from "@/lib/supabase/server";

export type CmsPageRecord = {
  bodyMarkdown: string;
  excerpt: string | null;
  id: number;
  kind: string;
  slug: string;
  status: string;
  title: string;
  updatedAt: string;
};

export async function getCmsPages(): Promise<CmsPageRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pages")
    .select("id, kind, title, slug, excerpt, body_markdown, status, updated_at")
    .order("updated_at", { ascending: false });

  if (error)
    throw new Error(`Could not load editorial pages: ${error.message}`);
  return (data ?? []).map((page) => ({
    bodyMarkdown: page.body_markdown,
    excerpt: page.excerpt,
    id: page.id,
    kind: page.kind,
    slug: page.slug,
    status: page.status,
    title: page.title,
    updatedAt: page.updated_at,
  }));
}
