"use client";

import { useState } from "react";

import { AssetIcon } from "@/components/ui/asset-icon";
import {
  formatAvailabilityLabel,
  formatVariantPriceLabel,
} from "@/features/catalog/domain/price";
import type { ProductDetail } from "@/features/catalog/domain/types";
import { cn } from "@/lib/utils/cn";

import { ShortlistButton } from "./shortlist-button";

/**
 * Variant choice lives on the client because it changes the price, availability
 * and the WhatsApp destination together. The inquiry link is a plain anchor to
 * `/inquiry`, so the redirect route can log the event before handing off — a
 * client-built wa.me link would skip that step.
 */
export function ProductInquiryPanel({ product }: { product: ProductDetail }) {
  const [variantId, setVariantId] = useState<string | null>(
    // Preselecting a single variant removes a pointless choice; with several,
    // the visitor must pick so the message cannot claim the wrong one.
    product.variants.length === 1 ? (product.variants[0]?.id ?? null) : null,
  );

  const variant =
    product.variants.find((option) => option.id === variantId) ?? null;

  const priceLabel = formatVariantPriceLabel(product, variant);
  const availability = variant?.availability ?? product.availability;

  const inquiryHref = variant
    ? `/inquiry?product=${encodeURIComponent(product.slug)}&variant=${encodeURIComponent(variant.sku)}`
    : `/inquiry?product=${encodeURIComponent(product.slug)}`;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex min-h-[30px] items-center rounded-full border border-orbit-gold px-3 text-[11px] font-semibold">
          {formatAvailabilityLabel(availability)}
        </span>
        {product.demo ? (
          <span className="text-[11px] font-semibold tracking-[0.04em] text-signal-red">
            PREVIEW DATA
          </span>
        ) : null}
      </div>

      {priceLabel ? (
        <p className="mt-5 text-2xl font-semibold">{priceLabel}</p>
      ) : null}

      {product.variants.length > 0 ? (
        <fieldset className="mt-6 border-0 p-0">
          <legend className="text-xs font-semibold tracking-[0.08em] text-smoke">
            SELECT AN OPTION
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.variants.map((option) => {
              const selected = option.id === variantId;

              return (
                <button
                  aria-pressed={selected}
                  className={cn(
                    "inline-flex min-h-11 items-center rounded-full border px-4 text-sm transition-colors",
                    selected
                      ? "border-obsidian bg-obsidian font-semibold text-porcelain"
                      : "border-smoke/60 hover:bg-porcelain",
                  )}
                  key={option.id}
                  onClick={() => setVariantId(selected ? null : option.id)}
                  type="button"
                >
                  {option.name}
                </button>
              );
            })}
          </div>
          {product.variants.length > 1 && !variant ? (
            <p className="mt-3 text-xs text-smoke">
              Choose an option and it will be included in your WhatsApp message.
            </p>
          ) : null}
        </fieldset>
      ) : null}

      <div className="mt-7 flex flex-wrap gap-3">
        <a
          className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-signal-green px-6 text-sm font-semibold text-white sm:flex-none"
          href={inquiryHref}
        >
          <AssetIcon name="message" size={18} />
          Ask on WhatsApp
        </a>
        <ShortlistButton
          productName={product.name}
          slug={product.slug}
          variantSku={variant?.sku ?? null}
          withLabel
        />
      </div>

      <p className="mt-4 text-xs leading-5 text-smoke">
        Availability and final price are confirmed by the store. Diverso Optics
        does not take online payments.
      </p>
    </div>
  );
}
