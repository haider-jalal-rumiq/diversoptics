"use client";

import Image from "next/image";
import { useState } from "react";

import { ProductMediaPlaceholder } from "@/components/home/product-media-placeholder";
import {
  focalObjectPosition,
  resolveImageUrl,
} from "@/features/catalog/domain/media";
import type { CatalogImage } from "@/features/catalog/domain/types";
import { cn } from "@/lib/utils/cn";

const MAIN_SIZES = "(min-width: 1024px) 32rem, 100vw";

/**
 * docs/04 asks for a stable aspect ratio, alt text and thumbnails. The frame keeps
 * its square ratio regardless of the source image so switching thumbnails cannot
 * shift the page and cost layout stability.
 */
export function ProductGallery({
  images,
  productName,
}: {
  images: readonly CatalogImage[];
  productName: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex] ?? images[0] ?? null;
  const source = resolveImageUrl(active);

  if (!active || !source) {
    return <ProductMediaPlaceholder />;
  }

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-lg bg-porcelain">
        <Image
          alt={active.altText || productName}
          className="object-cover"
          fill
          priority
          sizes={MAIN_SIZES}
          src={source}
          style={{ objectPosition: focalObjectPosition(active) }}
        />
      </div>

      {images.length > 1 ? (
        <ul
          aria-label={`More images of ${productName}`}
          className="mt-3 flex list-none gap-2 overflow-x-auto p-0"
        >
          {images.map((image, index) => {
            const thumbnail = resolveImageUrl(image);

            if (!thumbnail) return null;

            const selected = index === activeIndex;

            return (
              <li key={image.id}>
                <button
                  aria-current={selected ? "true" : undefined}
                  aria-label={`Show image ${index + 1} of ${images.length}`}
                  className={cn(
                    "relative size-20 shrink-0 overflow-hidden rounded-lg border-2 bg-porcelain",
                    selected ? "border-obsidian" : "border-transparent",
                  )}
                  onClick={() => setActiveIndex(index)}
                  type="button"
                >
                  <Image
                    alt=""
                    className="object-cover"
                    fill
                    sizes="80px"
                    src={thumbnail}
                    style={{ objectPosition: focalObjectPosition(image) }}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
