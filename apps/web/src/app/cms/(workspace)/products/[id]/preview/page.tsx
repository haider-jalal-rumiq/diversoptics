import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { StatusBadge } from "@/components/cms/status-badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Product preview" };

export default async function ProductPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isSafeInteger(productId) || productId <= 0) notFound();

  const supabase = await createClient();
  const { data: product, error } = await supabase
    .from("products")
    .select(
      "id, name, eyebrow, short_description, description, model_number, sku, price_mode, price, currency, availability, status, brands(name), categories(name), product_media(public_path, alt_text, is_primary, rights_status, archived_at)",
    )
    .eq("id", productId)
    .maybeSingle();
  if (error || !product) notFound();

  const primary = product.product_media.find(
    (media) =>
      media.is_primary &&
      media.archived_at === null &&
      media.rights_status === "approved" &&
      media.public_path,
  );
  const publicUrl = primary?.public_path
    ? supabase.storage.from("catalog-public").getPublicUrl(primary.public_path)
        .data.publicUrl
    : null;

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-smoke/15 bg-white shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-charcoal px-5 py-4 text-white">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-orbit-gold px-3 py-1 text-xs font-bold text-obsidian">
            CMS PREVIEW
          </span>
          <StatusBadge value={product.status} />
        </div>
        <Button asChild tone="quiet">
          <Link href={`/cms/products/${productId}`}>Back to editor</Link>
        </Button>
      </div>
      <div className="grid lg:grid-cols-2">
        <div className="relative min-h-[24rem] bg-porcelain lg:min-h-[42rem]">
          {publicUrl && primary ? (
            <Image
              alt={primary.alt_text}
              className="object-contain p-8"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              src={publicUrl}
            />
          ) : (
            <div className="grid h-full min-h-[24rem] place-items-center p-8 text-center text-sm text-smoke">
              Approved primary media will appear here.
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
          <p className="text-xs font-bold tracking-[0.18em] text-brass-ink uppercase">
            {product.eyebrow ?? product.categories.name}
          </p>
          <h1 className="mt-4 font-display text-5xl leading-none sm:text-6xl">
            {product.name}
          </h1>
          <p className="mt-4 text-sm text-smoke">
            {product.brands?.name ?? "Diverso selection"} ·{" "}
            {product.model_number} · {product.sku}
          </p>
          {product.short_description ? (
            <p className="mt-7 text-lg leading-8">
              {product.short_description}
            </p>
          ) : null}
          {product.description ? (
            <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-smoke">
              {product.description}
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-smoke/15 pt-7">
            <strong className="text-lg">
              {formatPrice(product.price_mode, product.price, product.currency)}
            </strong>
            <span className="text-sm capitalize text-smoke">
              {product.availability.replaceAll("_", " ")}
            </span>
          </div>
          <Button className="mt-7 w-full sm:w-auto" disabled>
            Ask on WhatsApp (preview)
          </Button>
        </div>
      </div>
    </div>
  );
}

function formatPrice(mode: string, value: number | null, currency: string) {
  if (mode === "on_inquiry") return "Price on inquiry";
  if (mode === "hidden") return "Price hidden";
  if (value === null) return "Price unavailable";
  const formatted = new Intl.NumberFormat("en-PK", {
    currency,
    maximumFractionDigits: 0,
    style: "currency",
  }).format(Number(value));
  return mode === "from" ? `From ${formatted}` : formatted;
}
