import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .max(5_000)
  .transform((value) => value || null);

export const productFormSchema = z
  .object({
    availability: z.enum([
      "in_store",
      "available_to_order",
      "out_of_stock",
      "ask",
    ]),
    brandId: z.string().regex(/^\d+$/).transform(Number).nullable(),
    categoryId: z.string().regex(/^\d+$/).transform(Number),
    currency: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z]{3}$/),
    description: optionalText,
    eyebrow: z
      .string()
      .trim()
      .max(80)
      .transform((value) => value || null),
    featured: z.boolean(),
    modelNumber: z.string().trim().min(1).max(120),
    name: z.string().trim().min(2).max(160),
    price: z
      .string()
      .trim()
      .transform((value) => (value ? Number(value) : null)),
    priceMode: z.enum(["fixed", "from", "on_inquiry", "hidden"]),
    shortDescription: z
      .string()
      .trim()
      .max(320)
      .transform((value) => value || null),
    sku: z.string().trim().min(1).max(120),
    slug: z
      .string()
      .trim()
      .min(1)
      .max(180)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
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
        message: "Enter a positive price for this price mode.",
        path: ["price"],
      });
    }

    if (
      (data.priceMode === "on_inquiry" || data.priceMode === "hidden") &&
      data.price !== null
    ) {
      context.addIssue({
        code: "custom",
        message: "Remove the price or choose Fixed/From.",
        path: ["price"],
      });
    }
  });

export type ProductFormValues = z.output<typeof productFormSchema>;

export function createSlug(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 180);
}
