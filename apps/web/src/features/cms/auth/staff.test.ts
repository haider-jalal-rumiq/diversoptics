import { describe, expect, it } from "vitest";

import { canEditCatalog } from "@/features/cms/domain/permissions";

describe("CMS catalog permissions", () => {
  it.each(["owner", "editor"] as const)("allows %s to edit", (role) => {
    expect(canEditCatalog(role)).toBe(true);
  });

  it("keeps viewers read-only", () => {
    expect(canEditCatalog("viewer")).toBe(false);
  });
});
