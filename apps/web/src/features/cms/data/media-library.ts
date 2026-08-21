import "server-only";

import { createClient } from "@/lib/supabase/server";

export async function getMediaLibrary() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_media")
    .select(
      "id, alt_text, rights_status, is_primary, width, height, public_path, products(id, name, sku)",
    )
    .is("archived_at", null)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(`Could not load the media library: ${error.message}`);
  }

  return (data ?? []).map((media) => ({
    altText: media.alt_text,
    height: media.height,
    id: media.id,
    isPrimary: media.is_primary,
    product: media.products,
    publicUrl: media.public_path
      ? supabase.storage.from("catalog-public").getPublicUrl(media.public_path)
          .data.publicUrl
      : null,
    rightsStatus: media.rights_status,
    width: media.width,
  }));
}
