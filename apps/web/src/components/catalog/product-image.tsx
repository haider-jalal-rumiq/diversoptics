import Image from "next/image";

import { ProductMediaPlaceholder } from "@/components/home/product-media-placeholder";
import {
  focalObjectPosition,
  resolveImageUrl,
} from "@/features/catalog/domain/media";
import type { CatalogImage } from "@/features/catalog/domain/types";
import { cn } from "@/lib/utils/cn";

type ProductImageProps = {
  className?: string;
  compact?: boolean;
  image: CatalogImage | null;
  /** Only the first image above the fold should claim loading priority. */
  priority?: boolean;
  sizes: string;
};

/**
 * A product with no approved derivative renders the Golden Orbit placeholder
 * rather than a broken frame, so an incomplete CMS record degrades visibly but
 * without misrepresenting the item.
 */
export function ProductImage({
  className,
  compact = false,
  image,
  priority = false,
  sizes,
}: ProductImageProps) {
  const source = resolveImageUrl(image);

  if (!image || !source) {
    return <ProductMediaPlaceholder compact={compact} />;
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-porcelain",
        compact ? "h-52" : "aspect-square",
        className,
      )}
    >
      <Image
        alt={image.altText}
        className="object-cover"
        fill
        priority={priority}
        sizes={sizes}
        src={source}
        style={{ objectPosition: focalObjectPosition(image) }}
      />
    </div>
  );
}
