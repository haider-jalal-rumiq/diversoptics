import "server-only";

import { cache } from "react";

import type { StaffRole } from "@/features/catalog/domain/types";
import { canEditCatalog } from "@/features/cms/domain/permissions";
import { logSecurityEvent } from "@/lib/security/security-log";
import { createClient } from "@/lib/supabase/server";

export type CurrentStaff = {
  displayName: string | null;
  email: string | null;
  id: string;
  role: StaffRole;
};

/** Returns only active staff backed by a cryptographically verified claim. */
export const getCurrentStaff = cache(async (): Promise<CurrentStaff | null> => {
  const supabase = await createClient();
  const { data: claimData, error: claimError } =
    await supabase.auth.getClaims();
  const subject = claimData?.claims?.sub;

  if (claimError || typeof subject !== "string") {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, display_name, role, status")
    .eq("id", subject)
    .maybeSingle();

  if (profileError || !profile || profile.status !== "active") {
    return null;
  }

  const claims = claimData?.claims;
  const email = typeof claims?.email === "string" ? claims.email : null;

  return {
    displayName: profile.display_name,
    email,
    id: profile.id,
    role: profile.role as StaffRole,
  };
});

export { canEditCatalog };

/** Every mutation calls this independently; hiding a form is never authorization. */
export async function requireCatalogEditor(): Promise<CurrentStaff> {
  const staff = await getCurrentStaff();

  if (!staff) {
    logSecurityEvent("cms.unauthenticated_mutation", { required: "editor" });

    throw new Error("You are not authorized to change catalog content.");
  }

  if (!canEditCatalog(staff.role)) {
    logSecurityEvent("cms.authorization_denied", {
      required: "editor",
      role: staff.role,
    });

    throw new Error("You are not authorized to change catalog content.");
  }

  return staff;
}

export async function requireOwner(): Promise<CurrentStaff> {
  const staff = await getCurrentStaff();

  if (!staff) {
    logSecurityEvent("cms.unauthenticated_mutation", { required: "owner" });

    throw new Error("Only an owner can change staff or critical settings.");
  }

  if (staff.role !== "owner") {
    logSecurityEvent("cms.authorization_denied", {
      required: "owner",
      role: staff.role,
    });

    throw new Error("Only an owner can change staff or critical settings.");
  }

  return staff;
}
