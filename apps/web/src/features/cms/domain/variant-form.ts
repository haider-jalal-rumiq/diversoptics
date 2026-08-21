import { z } from "zod";

export const variantFormSchema = z
  .object({
    availability: z.enum([
      "in_store",
      "available_to_order",
      "out_of_stock",
      "ask",
    ]),
    name: z.string().trim().min(1).max(120),
    price: z
      .string()
      .trim()
      .transform((value) => (value ? Number(value) : null)),
    priceMode: z
      .union([z.literal(""), z.enum(["fixed", "from", "on_inquiry", "hidden"])])
      .transform((value) => value || null),
    sku: z.string().trim().min(1).max(120),
    sortOrder: z.coerce.number().int().min(0).max(10_000),
    status: z.enum(["draft", "published", "archived"]),
    updatedAt: z.iso.datetime().nullable(),
  })
  .superRefine((data, context) => {
    if (
      (data.priceMode === "fixed" || data.priceMode === "from") &&
      (data.price === null || !Number.isFinite(data.price) || data.price <= 0)
    ) {
      context.addIssue({
        code: "custom",
        message: "A price is required.",
        path: ["price"],
      });
    }

    if (
      (data.priceMode === null ||
        data.priceMode === "on_inquiry" ||
        data.priceMode === "hidden") &&
      data.price !== null
    ) {
      context.addIssue({
        code: "custom",
        message: "Remove this price.",
        path: ["price"],
      });
    }
  });
