import { createClient } from "@/lib/supabase/server";

export type CmsDashboardData = {
  auditEvents: Array<{
    createdAt: string;
    id: number;
    operation: string;
    tableName: string;
  }>;
  counts: {
    brands: number;
    media: number;
    products: number;
    publishedProducts: number;
  };
};

export async function getCmsDashboardData(): Promise<CmsDashboardData> {
  const supabase = await createClient();
  const [products, published, brands, media, audit] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("status", "published")
      .is("archived_at", null),
    supabase.from("brands").select("id", { count: "exact", head: true }),
    supabase.from("product_media").select("id", { count: "exact", head: true }),
    supabase
      .from("audit_log")
      .select("id, entity_table, action, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const error =
    products.error ??
    published.error ??
    brands.error ??
    media.error ??
    audit.error;

  if (error) {
    throw new Error(`Could not load the CMS overview: ${error.message}`);
  }

  return {
    auditEvents: (audit.data ?? []).map((event) => ({
      createdAt: event.created_at,
      id: event.id,
      operation: event.action.toLowerCase(),
      tableName: event.entity_table,
    })),
    counts: {
      brands: brands.count ?? 0,
      media: media.count ?? 0,
      products: products.count ?? 0,
      publishedProducts: published.count ?? 0,
    },
  };
}
import "server-only";
