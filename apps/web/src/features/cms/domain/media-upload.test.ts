import { describe, expect, it } from "vitest";

import {
  getMediaSourceExtension,
  isExpectedMediaSourcePath,
  MAX_MEDIA_SOURCE_BYTES,
  mediaUploadIntentSchema,
} from "@/features/cms/domain/media-upload";

describe("media upload intent", () => {
  it("accepts a supported source at the bucket limit", () => {
    expect(
      mediaUploadIntentSchema.safeParse({
        byteSize: MAX_MEDIA_SOURCE_BYTES,
        mimeType: "image/avif",
      }).success,
    ).toBe(true);
  });

  it("rejects unsupported or oversized sources", () => {
    expect(
      mediaUploadIntentSchema.safeParse({
        byteSize: MAX_MEDIA_SOURCE_BYTES + 1,
        mimeType: "image/svg+xml",
      }).success,
    ).toBe(false);
  });

  it("only accepts a staged UUID path for the intended product and type", () => {
    const path = "42/originals/da4e7d91-c425-4e22-9d3a-429177dd4b51.webp";

    expect(isExpectedMediaSourcePath(42, path, "image/webp")).toBe(true);
    expect(isExpectedMediaSourcePath(41, path, "image/webp")).toBe(false);
    expect(isExpectedMediaSourcePath(42, path, "image/jpeg")).toBe(false);
    expect(
      isExpectedMediaSourcePath(42, "42/../../private.webp", "image/webp"),
    ).toBe(false);
  });

  it("uses normalized safe extensions", () => {
    expect(getMediaSourceExtension("image/jpeg")).toBe("jpg");
  });
});
