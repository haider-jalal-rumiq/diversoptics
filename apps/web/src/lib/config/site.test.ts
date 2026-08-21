import { describe, expect, it } from "vitest";

import { buildGeneralWhatsAppHref, getWhatsAppDestination } from "./site";

describe("WhatsApp environment isolation", () => {
  it("uses the client-approved production number only in production", () => {
    expect(getWhatsAppDestination("production").internationalDigits).toBe(
      "923335777710",
    );
  });

  it("uses the test number in previews", () => {
    expect(getWhatsAppDestination("preview").internationalDigits).toBe(
      "923438067821",
    );
  });

  it("encodes the general inquiry without leaking the production number", () => {
    const url = new URL(buildGeneralWhatsAppHref("test"));

    expect(url.pathname).toBe("/923438067821");
    expect(url.pathname).not.toContain("923335777710");
    expect(url.searchParams.get("text")).toContain("Diverso Optics");
  });
});
