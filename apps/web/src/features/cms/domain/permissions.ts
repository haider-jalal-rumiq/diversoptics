import type { StaffRole } from "@/features/catalog/domain/types";

export function canEditCatalog(role: StaffRole) {
  return role === "owner" || role === "editor";
}
