"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireCatalogEditor } from "@/features/cms/auth/staff";
import { csvRowsToRecords, parseCsv } from "@/features/cms/domain/csv";
import { createClient } from "@/lib/supabase/server";

const MAX_CSV_BYTES = 1_000_000;
const MAX_ROWS = 500;
const draftSchema = z.object({
  availability: z
    .union([
      z.literal(""),
      z.enum(["in_store", "available_to_order", "out_of_stock", "ask"]),
    ])
    .transform((value) => value || "ask"),
  brand_slug: z.string().max(140),
  category_slug: z.string().min(1).max(140),
  description: z.string().max(5_000),
  eyebrow: z.string().max(80),
  model_number: z.string().min(1).max(120),
  name: z.string().min(2).max(160),
  price: z.string().max(30),
  price_mode: z
    .union([z.literal(""), z.enum(["fixed", "from", "on_inquiry", "hidden"])])
    .transform((value) => value || "on_inquiry"),
  short_description: z.string().max(320),
  sku: z.string().min(1).max(120),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(180),
});

export type ImportActionState = {
  imported?: number;
  message?: string;
  success?: boolean;
};

export async function importProductDrafts(
  _previousState: ImportActionState,
  formData: FormData,
): Promise<ImportActionState> {
  await requireCatalogEditor();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0 || file.size > MAX_CSV_BYTES) {
    return { message: "Choose a CSV file no larger than 1 MB." };
  }

  let rows: ReturnType<typeof csvRowsToRecords>;
  try {
    rows = csvRowsToRecords(parseCsv(await file.text()));
  } catch (error) {
    return {
      message:
        error instanceof Error ? error.message : "The CSV could not be read.",
    };
  }
  if (!rows.length) return { message: "The CSV contains no product rows." };
  if (rows.length > MAX_ROWS)
    return { message: `Import at most ${MAX_ROWS} rows at once.` };

  const parsedRows = rows.map((row) => ({
    ...row,
    parsed: draftSchema.safeParse({
      availability: row.values.availability ?? "",
      brand_slug: row.values.brand_slug ?? "",
      category_slug: row.values.category_slug,
      description: row.values.description ?? "",
      eyebrow: row.values.eyebrow ?? "",
      model_number: row.values.model_number,
      name: row.values.name,
      price: row.values.price ?? "",
      price_mode: row.values.price_mode ?? "",
      short_description: row.values.short_description ?? "",
      sku: row.values.sku,
      slug: row.values.slug,
    }),
  }));
  const invalid = parsedRows.find((row) => !row.parsed.success);
  if (invalid)
    return {
      message: `Row ${invalid.rowNumber} has missing or invalid fields.`,
    };

  const values = parsedRows.map((row) => {
    if (!row.parsed.success)
      throw new Error("Validated row unexpectedly failed.");
    return { rowNumber: row.rowNumber, ...row.parsed.data };
  });
  const duplicateSku = values.find(
    (value, index) =>
      values.findIndex((item) => item.sku === value.sku) !== index,
  );
  const duplicateSlug = values.find(
    (value, index) =>
      values.findIndex((item) => item.slug === value.slug) !== index,
  );
  if (duplicateSku || duplicateSlug) {
    return {
      message: `Duplicate ${duplicateSku ? "SKU" : "slug"} inside the CSV.`,
    };
  }

  for (const value of values) {
    const price = value.price ? Number(value.price) : null;
    const priceRequired =
      value.price_mode === "fixed" || value.price_mode === "from";
    if (
      (priceRequired && (!price || price <= 0)) ||
      (!priceRequired && price !== null)
    ) {
      return {
        message: `Row ${value.rowNumber} has a price that conflicts with its price mode.`,
      };
    }
  }

  const categorySlugs = [
    ...new Set(values.map((value) => value.category_slug)),
  ];
  const brandSlugs = [
    ...new Set(values.map((value) => value.brand_slug).filter(Boolean)),
  ];
  const supabase = await createClient();
  const [categoriesResult, brandsResult] = await Promise.all([
    supabase.from("categories").select("id, slug").in("slug", categorySlugs),
    brandSlugs.length
      ? supabase.from("brands").select("id, slug").in("slug", brandSlugs)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (categoriesResult.error || brandsResult.error)
    return { message: "Categories and brands could not be resolved." };

  const categoryIds = new Map(
    (categoriesResult.data ?? []).map((item) => [item.slug, item.id]),
  );
  const brandIds = new Map(
    (brandsResult.data ?? []).map((item) => [item.slug, item.id]),
  );
  const missingReference = values.find(
    (value) =>
      !categoryIds.has(value.category_slug) ||
      (value.brand_slug && !brandIds.has(value.brand_slug)),
  );
  if (missingReference)
    return {
      message: `Row ${missingReference.rowNumber} references an unknown category or brand slug.`,
    };

  const inserts = values.map((value) => ({
    availability: value.availability,
    brand_id: value.brand_slug
      ? (brandIds.get(value.brand_slug) ?? null)
      : null,
    category_id: categoryIds.get(value.category_slug)!,
    description: value.description || null,
    eyebrow: value.eyebrow || null,
    model_number: value.model_number,
    name: value.name,
    price: value.price ? Number(value.price) : null,
    price_mode: value.price_mode,
    short_description: value.short_description || null,
    sku: value.sku,
    slug: value.slug,
    status: "draft",
  }));
  const { error } = await supabase.from("products").insert(inserts);
  if (error) {
    return {
      message: error.message.includes("duplicate")
        ? "A SKU or slug already exists; no drafts were imported."
        : "The drafts could not be imported.",
    };
  }

  revalidatePath("/cms");
  revalidatePath("/cms/products");
  return {
    imported: inserts.length,
    message: `${inserts.length} drafts imported.`,
    success: true,
  };
}
