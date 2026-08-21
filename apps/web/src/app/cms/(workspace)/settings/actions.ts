"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireOwner } from "@/features/cms/auth/staff";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, hasSupabaseSecretKey } from "@/lib/supabase/admin";

export type SettingsActionState = { message?: string; success?: boolean };

const settingsSchema = z.object({
  deliveryAvailable: z.boolean(),
  fullAddress: z
    .string()
    .trim()
    .max(300)
    .transform((value) => value || null),
  locationLabel: z.string().trim().min(3).max(120),
  phoneNumber: z
    .string()
    .trim()
    .max(30)
    .transform((value) => value || null),
  publicEmail: z
    .union([z.literal(""), z.email()])
    .transform((value) => value || null),
  updatedAt: z.iso.datetime(),
  whatsappNumber: z
    .string()
    .trim()
    .transform((value) => value.replace(/[\s()-]/g, ""))
    .pipe(z.string().regex(/^\+[1-9]\d{7,14}$/)),
});

export async function saveSettings(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  await requireOwner();
  const parsed = settingsSchema.safeParse({
    deliveryAvailable: formData.get("deliveryAvailable") === "on",
    fullAddress: formData.get("fullAddress"),
    locationLabel: formData.get("locationLabel"),
    phoneNumber: formData.get("phoneNumber"),
    publicEmail: formData.get("publicEmail"),
    updatedAt: formData.get("updatedAt"),
    whatsappNumber: formData.get("whatsappNumber"),
  });

  if (!parsed.success) {
    return {
      message:
        "Review the contact fields and use an international WhatsApp number.",
    };
  }

  const values = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .update({
      delivery_available: values.deliveryAvailable,
      full_address: values.fullAddress,
      location_label: values.locationLabel,
      phone_number: values.phoneNumber,
      public_email: values.publicEmail,
      whatsapp_number: values.whatsappNumber,
    })
    .eq("id", true)
    .eq("updated_at", values.updatedAt)
    .select("id")
    .maybeSingle();

  if (error) return { message: "The settings could not be saved." };
  if (!data)
    return { message: "Settings changed elsewhere. Refresh and try again." };

  revalidatePath("/cms/settings");
  return { message: "Settings saved.", success: true };
}

const profileSchema = z.object({
  profileId: z.uuid(),
  role: z.enum(["owner", "editor", "viewer"]),
  status: z.enum(["active", "disabled"]),
});

export async function updateStaffProfile(formData: FormData) {
  const owner = await requireOwner();
  const parsed = profileSchema.safeParse({
    profileId: formData.get("profileId"),
    role: formData.get("role"),
    status: formData.get("status"),
  });

  if (!parsed.success) throw new Error("The staff update is invalid.");
  if (parsed.data.profileId === owner.id) {
    throw new Error("Owners cannot change their own access from this screen.");
  }

  const supabase = await createClient();
  const { data: target, error: targetError } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", parsed.data.profileId)
    .maybeSingle();

  if (targetError || !target)
    throw new Error("The staff profile was not found.");

  if (
    target.role === "owner" &&
    target.status === "active" &&
    (parsed.data.role !== "owner" || parsed.data.status !== "active")
  ) {
    const { count } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "owner")
      .eq("status", "active");
    if ((count ?? 0) <= 1)
      throw new Error("The CMS must retain one active owner.");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role: parsed.data.role, status: parsed.data.status })
    .eq("id", parsed.data.profileId);

  if (error) throw new Error("The staff profile could not be updated.");
  revalidatePath("/cms/settings");
}

const inviteSchema = z.object({
  displayName: z.string().trim().min(2).max(100),
  email: z.email().trim().toLowerCase(),
  role: z.enum(["editor", "viewer"]),
});

export async function inviteStaff(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  await requireOwner();
  if (!hasSupabaseSecretKey()) {
    return {
      message: "Server-side invitation credentials are not configured.",
    };
  }

  const parsed = inviteSchema.safeParse({
    displayName: formData.get("displayName"),
    email: formData.get("email"),
    role: formData.get("role"),
  });
  if (!parsed.success)
    return { message: "Enter a valid staff name, email, and role." };

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.inviteUserByEmail(
    parsed.data.email,
    {
      data: { display_name: parsed.data.displayName },
    },
  );
  if (error || !data.user) {
    return {
      message:
        "The invitation could not be sent. The address may already exist.",
    };
  }

  const supabase = await createClient();
  const { error: activationError } = await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.displayName,
      role: parsed.data.role,
      status: "active",
    })
    .eq("id", data.user.id);
  if (activationError) {
    return {
      message:
        "The identity was invited but remains disabled; activate it below.",
    };
  }

  revalidatePath("/cms/settings");
  return {
    message: "Invitation sent and staff access activated.",
    success: true,
  };
}
