import "server-only";

import { createClient } from "@/lib/supabase/server";

export async function getCmsSettings() {
  const supabase = await createClient();
  const [settingsResult, profilesResult] = await Promise.all([
    supabase
      .from("site_settings")
      .select(
        "id, location_label, full_address, whatsapp_number, phone_number, public_email, business_hours, delivery_available, updated_at",
      )
      .eq("id", true)
      .single(),
    supabase
      .from("profiles")
      .select("id, display_name, role, status, created_at")
      .order("created_at"),
  ]);

  const error = settingsResult.error ?? profilesResult.error;
  if (error) throw new Error(`Could not load CMS settings: ${error.message}`);
  if (!settingsResult.data)
    throw new Error("The singleton site settings row is missing.");

  return {
    profiles: profilesResult.data ?? [],
    settings: settingsResult.data,
  };
}
