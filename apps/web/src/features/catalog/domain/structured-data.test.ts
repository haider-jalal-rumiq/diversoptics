import { describe, expect, it } from "vitest";

import { siteConfig } from "@/lib/config/site";

import { buildLocalBusinessSchema } from "./structured-data";
import type { StoreSettings } from "./types";

const settings: StoreSettings = {
  businessHours: [],
  deliveryAvailable: false,
  fullAddress: null,
  locationLabel: "F-11 Markaz, Islamabad",
  phoneNumber: null,
  publicEmail: null,
  whatsappNumber: "923335777710",
};

describe("buildLocalBusinessSchema", () => {
  it("points hasMap at the store's own Google listing", () => {
    const schema = buildLocalBusinessSchema({
      settings,
      siteUrl: "https://diverso.example",
    });

    expect(schema.hasMap).toBe(siteConfig.googleMapsUrl);
  });

  it("claims only the social profiles that have a confirmed URL", () => {
    const schema = buildLocalBusinessSchema({
      settings,
      siteUrl: "https://diverso.example",
    });
    const confirmed = siteConfig.social.flatMap((profile) =>
      profile.href ? [profile.href] : [],
    );

    expect(schema.sameAs).toEqual(confirmed);
    // sameAs asserts ownership, so an unconfirmed profile must never appear —
    // a null href is the placeholder state, not a URL.
    expect(schema.sameAs).not.toContain(null);
    expect(
      (schema.sameAs as readonly string[]).every((url) =>
        url.startsWith("https://"),
      ),
    ).toBe(true);
  });
});
