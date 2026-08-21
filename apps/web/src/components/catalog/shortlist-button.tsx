"use client";

import { AssetIcon } from "@/components/ui/asset-icon";
import { SHORTLIST_LIMIT } from "@/features/catalog/domain/shortlist";
import { cn } from "@/lib/utils/cn";

import { toggleShortlistEntry, useShortlist } from "./use-shortlist";

type ShortlistButtonProps = {
  className?: string;
  productName: string;
  slug: string;
  variantSku?: string | null;
  /** Renders a labelled button for the product page instead of a card icon. */
  withLabel?: boolean;
};

export function ShortlistButton({
  className,
  productName,
  slug,
  variantSku = null,
  withLabel = false,
}: ShortlistButtonProps) {
  const { contains, isFull } = useShortlist();
  const active = contains(slug);

  // A full shortlist would silently ignore the tap, so the control says why
  // instead of looking broken.
  const blocked = !active && isFull;

  const label = active
    ? `Remove ${productName} from your shortlist`
    : blocked
      ? `Shortlist is full at ${SHORTLIST_LIMIT} items`
      : `Add ${productName} to your shortlist`;

  return (
    <button
      aria-label={withLabel ? undefined : label}
      aria-pressed={active}
      className={cn(
        withLabel
          ? "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-obsidian px-5 text-sm font-semibold transition-colors"
          : "grid size-12 place-items-center rounded-full bg-white shadow-card transition-colors",
        active && "bg-orbit-gold",
        blocked && "cursor-not-allowed opacity-50",
        className,
      )}
      disabled={blocked}
      onClick={() => toggleShortlistEntry({ slug, variantSku })}
      title={label}
      type="button"
    >
      <AssetIcon name="heart" size={withLabel ? 18 : 24} />
      {withLabel ? (
        <span>{active ? "In your shortlist" : "Add to shortlist"}</span>
      ) : null}
    </button>
  );
}

export function ShortlistCountBadge() {
  const { entries } = useShortlist();

  // The server snapshot is empty, so nothing renders until hydration adopts the
  // stored value. That avoids flashing a zero.
  if (entries.length === 0) return null;

  return (
    <span className="absolute right-0 top-0 grid size-5 place-items-center rounded-full bg-orbit-gold text-[10px] font-semibold">
      {entries.length}
    </span>
  );
}
