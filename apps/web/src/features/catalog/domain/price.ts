import type {
  Availability,
  ProductSummary,
  ProductVariantOption,
} from "./types";

const availabilityLabels: Record<Availability, string> = {
  ask: "Ask for status",
  available_to_order: "Available to order",
  in_store: "In store",
  out_of_stock: "Out of stock",
};

/**
 * docs/04 requires availability to carry a precise meaning rather than a vague
 * in-stock badge, so the four states are spelled out for the visitor.
 */
export function formatAvailabilityLabel(availability: Availability): string {
  return availabilityLabels[availability];
}

export function formatCurrency(amount: number, currency: string): string {
  // Rupee prices are usually whole; showing ".00" on every card adds noise, but
  // a genuine half-rupee amount must not be silently rounded away.
  const fractionDigits = Number.isInteger(amount) ? 0 : 2;

  try {
    return new Intl.NumberFormat("en-PK", {
      currency,
      maximumFractionDigits: fractionDigits,
      minimumFractionDigits: fractionDigits,
      style: "currency",
    }).format(amount);
  } catch {
    // An unexpected currency code must never break a product page.
    return `${currency} ${amount.toFixed(fractionDigits)}`;
  }
}

type PriceCarrier = Pick<ProductSummary, "currency" | "price" | "priceMode">;

/**
 * docs/04 forbids showing an empty or zero price. A record whose mode expects an
 * amount but has none falls back to the inquiry wording instead of rendering a
 * misleading number, so a bad row degrades into an honest prompt.
 */
export function formatPriceLabel(product: PriceCarrier): string | null {
  if (product.priceMode === "hidden") return null;
  if (product.priceMode === "on_inquiry") return "Price on inquiry";

  const amount = product.price === null ? null : Number(product.price);

  if (amount === null || !Number.isFinite(amount) || amount <= 0) {
    return "Price on inquiry";
  }

  const formatted = formatCurrency(amount, product.currency);

  return product.priceMode === "from" ? `From ${formatted}` : formatted;
}

/**
 * A variant may override price, inherit it, or carry no pricing of its own. The
 * inherited case must show the product price rather than an inquiry fallback.
 */
export function formatVariantPriceLabel(
  product: PriceCarrier,
  variant: ProductVariantOption | null,
): string | null {
  if (!variant || (variant.priceMode === null && variant.price === null)) {
    return formatPriceLabel(product);
  }

  return formatPriceLabel({
    currency: product.currency,
    price: variant.price,
    priceMode: variant.priceMode ?? product.priceMode,
  });
}
