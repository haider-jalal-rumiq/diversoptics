import {
  getWhatsAppDestination,
  resolveDeploymentEnvironment,
  type DeploymentEnvironment,
} from "@/lib/config/site";

import type { InquirySnapshotItem } from "./types";

/**
 * Message bodies follow the approved templates in `docs/04-website-ux-and-content.md`
 * so the person answering WhatsApp always receives the product, model, variant,
 * shown price and canonical link without asking the customer to retype anything.
 */

const NOT_SELECTED = "not selected";

function describeItem(item: InquirySnapshotItem): string {
  return [item.brand, item.name].filter(Boolean).join(" ").trim() || item.name;
}

export function buildSingleProductMessage(
  item: InquirySnapshotItem,
  reference: string | null,
): string {
  const lines = [
    "Hello Diverso Optics — I’m interested in:",
    "",
    describeItem(item),
    `Model/SKU: ${item.sku}`,
    `Variant: ${item.variantSku ?? NOT_SELECTED}`,
    `Price shown: ${item.priceLabel ?? "price on inquiry"}`,
    `Link: ${item.url}`,
    "",
    "Please confirm current availability and final price.",
  ];

  if (reference) lines.push(`Ref: ${reference}`);

  return lines.join("\n");
}

export function buildShortlistMessage(
  items: readonly InquirySnapshotItem[],
  note: string | null,
  reference: string | null,
): string {
  const lines = [
    "Hello Diverso Optics — I’d like help comparing these items:",
    "",
    ...items.map((item, index) =>
      [
        `${index + 1}. ${describeItem(item)}`,
        item.sku,
        item.variantSku ?? NOT_SELECTED,
        item.url,
      ].join(" — "),
    ),
    "",
  ];

  if (note) lines.push(`My preference/budget: ${note}`);

  lines.push("Please confirm availability and guide me.");

  if (reference) lines.push(`Ref: ${reference}`);

  return lines.join("\n");
}

/**
 * wa.me is the official click-to-chat entry point. The destination digits always
 * come from CMS settings so a hard-coded number cannot drift from the business.
 */
export function buildWhatsAppHref(
  internationalDigits: string,
  message: string,
): string {
  const digits = internationalDigits.replace(/\D/g, "");

  if (!digits) {
    throw new Error(
      "A WhatsApp destination requires the number in international digits.",
    );
  }

  const url = new URL(`https://wa.me/${digits}`);
  url.searchParams.set("text", message);

  return url.toString();
}

export type WhatsAppDestination = {
  display: string;
  internationalDigits: string;
};

/**
 * Resolves which number a click-to-chat link should dial.
 *
 * Outside production the CMS number is deliberately ignored. Phase 01 established
 * that test and production WhatsApp destinations must never mix, and every
 * environment reads the same settings row — which holds the real business number.
 * Without this guard a preview deployment or a local session would send test
 * inquiries to the live shop.
 *
 * In production the CMS is the source of truth, so the number can be corrected
 * without a deploy. A missing or unusable value falls back to the configured
 * destination rather than producing a broken link.
 */
export function resolveWhatsAppDestination(
  settingsNumber: string | null | undefined,
  environment: DeploymentEnvironment = resolveDeploymentEnvironment(),
): WhatsAppDestination {
  if (environment !== "production") {
    return getWhatsAppDestination(environment);
  }

  const digits = settingsNumber ? toInternationalDigits(settingsNumber) : null;

  return digits && settingsNumber
    ? { display: settingsNumber, internationalDigits: digits }
    : getWhatsAppDestination(environment);
}

/**
 * Settings store a display number such as "+92 333 5777710". Click-to-chat needs
 * bare international digits, and a local "03xx" form must be converted rather
 * than sent as-is, which WhatsApp would reject.
 */
export function toInternationalDigits(displayNumber: string): string | null {
  const digits = displayNumber.replace(/\D/g, "");

  if (!digits) return null;
  if (digits.startsWith("92")) return digits;
  if (digits.startsWith("0")) return `92${digits.slice(1)}`;

  return digits;
}
