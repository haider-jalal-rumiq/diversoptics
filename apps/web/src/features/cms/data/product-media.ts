import "server-only";

import { createClient } from "@/lib/supabase/server";

export type CmsMediaItem = {
  altText: string;
  createdAt: string;
  height: number;
  id: number;
  isPrimary: boolean;
  publicUrl: string | null;
  rightsStatus: string;
  width: number;
};

export async function getProductMedia(productId: number) {
  const supabase = await createClient();
  const [productResult, mediaResult] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, sku")
      .eq("id", productId)
      .maybeSingle(),
    supabase
      .from("product_media")
      .select(
        "id, public_path, alt_text, rights_status, width, height, is_primary, created_at",
      )
      .eq("product_id", productId)
      .is("archived_at", null)
      .order("sort_order")
      .order("created_at"),
  ]);

  const error = productResult.error ?? mediaResult.error;
  if (error) {
    throw new Error(`Could not load product media: ${error.message}`);
  }

  return {
    media: (mediaResult.data ?? []).map((media): CmsMediaItem => ({
      altText: media.alt_text,
      createdAt: media.created_at,
      height: media.height,
      id: media.id,
      isPrimary: media.is_primary,
      publicUrl: media.public_path
        ? supabase.storage
            .from("catalog-public")
            .getPublicUrl(media.public_path).data.publicUrl
        : null,
      rightsStatus: media.rights_status,
      width: media.width,
    })),
    product: productResult.data,
  };
}
