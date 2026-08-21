"use client";

import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { AssetIcon } from "@/components/ui/asset-icon";
import { buildStorageImageUrl } from "@/features/catalog/domain/media";
import { SHORTLIST_LIMIT } from "@/features/catalog/domain/shortlist";
import type { ShortlistApiProduct } from "@/features/catalog/domain/types";

import { removeShortlistEntry, useShortlist } from "./use-shortlist";

type Resolved = {
  key: string;
  products: readonly ShortlistApiProduct[];
};

export function ShortlistView() {
  const { entries } = useShortlist();
  const [resolved, setResolved] = useState<Resolved | null>(null);
  const [failedKey, setFailedKey] = useState<string | null>(null);

  const slugKey = entries.map((entry) => entry.slug).join(",");

  useEffect(() => {
    if (slugKey === "") return;

    const controller = new AbortController();
    const params = new URLSearchParams();

    for (const slug of slugKey.split(",")) params.append("slug", slug);

    // Every state update happens in an async callback, never synchronously in
    // the effect body, which would cascade renders.
    fetch(`/api/shortlist?${params.toString()}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Shortlist request failed");

        return response.json() as Promise<{ products: ShortlistApiProduct[] }>;
      })
      .then((payload) => {
        setResolved({ key: slugKey, products: payload.products });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError")
          return;

        setFailedKey(slugKey);
      });

    return () => controller.abort();
  }, [slugKey]);

  const variantFor = (slug: string) =>
    entries.find((entry) => entry.slug === slug)?.variantSku ?? null;

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-smoke/30 bg-white p-6">
        <h2 className="font-display text-3xl leading-tight">
          Your shortlist is empty.
        </h2>
        <p className="mt-3 max-w-prose text-sm leading-6 text-smoke">
          Add up to {SHORTLIST_LIMIT} pieces while you browse, then send them to
          the Diverso team in one WhatsApp message.
        </p>
        <Link
          className="mt-5 inline-flex min-h-11 items-center rounded-full border border-obsidian px-5 text-sm font-semibold"
          href="/new-and-featured"
        >
          Browse new &amp; featured
        </Link>
      </div>
    );
  }

  if (failedKey === slugKey) {
    // docs/04 asks for a visible data-error state rather than a silent blank.
    return (
      <div className="rounded-xl border border-signal-red/40 bg-white p-6">
        <p className="text-sm font-semibold text-signal-red">
          Your shortlist could not be loaded.
        </p>
        <p className="mt-2 text-sm text-smoke">
          The items are still saved in this browser. Reload the page to try
          again, or message the Diverso team directly.
        </p>
      </div>
    );
  }

  if (resolved?.key !== slugKey) {
    return (
      <p className="rounded-xl border border-smoke/30 bg-white p-6 text-sm text-smoke">
        Loading your shortlist…
      </p>
    );
  }

  const { products } = resolved;

  /**
   * A product unpublished or archived since it was saved comes back missing. It
   * is dropped and called out, so the WhatsApp message never references
   * something the store cannot supply.
   */
  const missingCount = entries.length - products.length;

  const shortlistParam = products
    .map((product) => {
      const variant = variantFor(product.slug);

      return variant ? `${product.slug}:${variant}` : product.slug;
    })
    .join(",");

  return (
    <div>
      {missingCount > 0 ? (
        <p className="mb-5 rounded-lg border border-smoke/40 bg-white px-4 py-3 text-sm text-smoke">
          {missingCount === 1
            ? "One saved item is no longer published and was left out."
            : `${missingCount} saved items are no longer published and were left out.`}
        </p>
      ) : null}

      <ul className="list-none space-y-3 p-0">
        {products.map((product) => {
          const variant = variantFor(product.slug);
          const image = buildStorageImageUrl(product.imagePath);

          return (
            <li
              className="flex items-center gap-4 rounded-xl border border-smoke/40 bg-white p-4"
              key={product.slug}
            >
              <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-porcelain">
                {image ? (
                  <Image
                    alt=""
                    className="object-cover"
                    fill
                    sizes="80px"
                    src={image}
                  />
                ) : null}
              </div>

              <div className="min-w-0 flex-1">
                {product.brandName ? (
                  <p className="text-[11px] font-semibold tracking-[0.06em] text-smoke">
                    {product.brandName.toUpperCase()}
                  </p>
                ) : null}
                <h2 className="truncate text-base font-semibold">
                  <Link
                    className="hover:underline"
                    href={product.href as Route}
                  >
                    {product.name}
                  </Link>
                </h2>
                <p className="text-xs text-smoke">
                  {product.sku}
                  {variant ? ` · ${variant}` : ""}
                </p>
                <p className="mt-1 text-xs text-smoke">
                  {product.availabilityLabel}
                  {product.priceLabel ? ` · ${product.priceLabel}` : ""}
                </p>
              </div>

              <button
                aria-label={`Remove ${product.name} from your shortlist`}
                className="min-h-11 rounded-full px-3 text-sm font-semibold text-smoke hover:underline"
                onClick={() => removeShortlistEntry(product.slug)}
                type="button"
              >
                Remove
              </button>
            </li>
          );
        })}
      </ul>

      <form
        action="/inquiry"
        className="mt-8 rounded-xl border border-smoke/40 bg-white p-5"
        method="get"
      >
        <input name="shortlist" type="hidden" value={shortlistParam} />

        <label
          className="text-xs font-semibold tracking-[0.08em] text-smoke"
          htmlFor="shortlist-note"
        >
          ANYTHING THE TEAM SHOULD KNOW? (OPTIONAL)
        </label>
        <textarea
          className="mt-2 w-full rounded-lg border border-smoke/60 p-3 text-sm"
          id="shortlist-note"
          maxLength={200}
          name="note"
          placeholder="Budget, preferred style, or when you plan to visit."
          rows={3}
        />

        {/*
          docs/04 forbids implying a reservation or payment. This is a request for
          help, not a cart.
        */}
        <p className="mt-3 text-xs leading-5 text-smoke">
          Sending this starts a WhatsApp conversation. It does not reserve any
          item, and availability and final price are confirmed by the store.
        </p>

        <button
          className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-signal-green px-6 text-sm font-semibold text-white sm:w-auto"
          type="submit"
        >
          <AssetIcon name="message" size={18} />
          Ask about this shortlist
        </button>
      </form>
    </div>
  );
}
