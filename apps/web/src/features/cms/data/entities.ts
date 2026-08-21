import "server-only";

import type { z } from "zod";

import type { entityKindSchema } from "@/features/cms/domain/entity-form";
import { createClient } from "@/lib/supabase/server";

export type EntityKind = z.infer<typeof entityKindSchema>;

export type CmsEntity = {
  description: string | null;
  eyebrow: string | null;
  featured: boolean;
  id: number;
  name: string;
  slug: string;
  sortOrder: number;
  status: string;
  updatedAt: string;
};

export async function getCmsEntities(kind: EntityKind): Promise<CmsEntity[]> {
  const supabase = await createClient();

  if (kind === "brand") {
    const { data, error } = await supabase
      .from("brands")
      .select(
        "id, name, slug, description, featured, sort_order, status, updated_at",
      )
      .order("sort_order")
      .order("name");
    if (error) throw new Error(`Could not load brands: ${error.message}`);
    return (data ?? []).map((item) => mapEntity(item, null));
  }

  if (kind === "category") {
    const { data, error } = await supabase
      .from("categories")
      .select(
        "id, name, slug, eyebrow, description, featured, sort_order, status, updated_at",
      )
      .order("sort_order")
      .order("name");
    if (error) throw new Error(`Could not load categories: ${error.message}`);
    return (data ?? []).map((item) => mapEntity(item, item.eyebrow));
  }

  const { data, error } = await supabase
    .from("collections")
    .select(
      "id, name, slug, eyebrow, description, featured, status, updated_at",
    )
    .order("name");
  if (error) throw new Error(`Could not load collections: ${error.message}`);
  return (data ?? []).map((item) =>
    mapEntity({ ...item, sort_order: 0 }, item.eyebrow),
  );
}

function mapEntity(
  item: {
    description: string | null;
    featured: boolean;
    id: number;
    name: string;
    slug: string;
    sort_order: number;
    status: string;
    updated_at: string;
  },
  eyebrow: string | null,
): CmsEntity {
  return {
    description: item.description,
    eyebrow,
    featured: item.featured,
    id: item.id,
    name: item.name,
    slug: item.slug,
    sortOrder: item.sort_order,
    status: item.status,
    updatedAt: item.updated_at,
  };
}
