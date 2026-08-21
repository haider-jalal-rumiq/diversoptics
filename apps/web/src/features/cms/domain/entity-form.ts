import { z } from "zod";

export const entityKindSchema = z.enum(["brand", "category", "collection"]);

export const entityFormSchema = z.object({
  description: z
    .string()
    .trim()
    .max(2_000)
    .transform((value) => value || null),
  eyebrow: z
    .string()
    .trim()
    .max(80)
    .transform((value) => value || null),
  featured: z.boolean(),
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .max(140)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  sortOrder: z.coerce.number().int().min(0).max(10_000),
  status: z.enum(["draft", "published", "archived"]),
  updatedAt: z.iso.datetime().nullable(),
});
