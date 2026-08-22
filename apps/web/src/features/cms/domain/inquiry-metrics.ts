export type InquiryEventRecord = {
  campaign: unknown;
  catalogSnapshot: unknown;
  createdAt: string;
  entryPath: string | null;
  eventType: string;
  publicId: string;
};

export type InquiryCount = { count: number; label: string };

export type InquirySummary = {
  total: number;
  singleProduct: number;
  shortlist: number;
  last7Days: number;
  last30Days: number;
  /** Distinct products asked about, not event count. */
  productsAsked: number;
  topProducts: readonly InquiryCount[];
  topSources: readonly InquiryCount[];
  topEntryPaths: readonly InquiryCount[];
};

const DAY_MS = 24 * 60 * 60 * 1000;

function snapshotItems(value: unknown): readonly Record<string, unknown>[] {
  if (!Array.isArray(value)) return [];

  return value.filter(
    (item): item is Record<string, unknown> =>
      typeof item === "object" && item !== null,
  );
}

function readString(
  record: Record<string, unknown>,
  key: string,
): string | null {
  const value = record[key];

  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function rank(counts: Map<string, number>, limit: number): InquiryCount[] {
  return [...counts.entries()]
    .map(([label, count]) => ({ count, label }))
    .sort((left, right) =>
      right.count === left.count
        ? left.label.localeCompare(right.label)
        : right.count - left.count,
    )
    .slice(0, limit);
}

/**
 * Aggregates recorded inquiry events into the figures `PROJECT.md` lists as
 * success measures: qualified WhatsApp inquiries, which products drive them, and
 * which campaign brought the visitor.
 *
 * `now` is injected rather than read from the clock so the rolling windows are
 * deterministic and testable.
 *
 * Nothing here touches `anonymous_session_hash`. The summary is about products
 * and campaigns, not about following individual visitors, and the hash is
 * deliberately not part of the input shape.
 */
export function summarizeInquiries(
  events: readonly InquiryEventRecord[],
  now: number,
  limit = 8,
): InquirySummary {
  const products = new Map<string, number>();
  const sources = new Map<string, number>();
  const paths = new Map<string, number>();

  let singleProduct = 0;
  let shortlist = 0;
  let last7Days = 0;
  let last30Days = 0;

  for (const event of events) {
    if (event.eventType === "single_product") singleProduct += 1;
    if (event.eventType === "shortlist") shortlist += 1;

    const age = now - Date.parse(event.createdAt);

    // An unparseable timestamp is left out of the windows rather than counted as
    // "just now", which would quietly inflate the recent figures.
    if (Number.isFinite(age) && age >= 0) {
      if (age <= 7 * DAY_MS) last7Days += 1;
      if (age <= 30 * DAY_MS) last30Days += 1;
    }

    for (const item of snapshotItems(event.catalogSnapshot)) {
      const slug = readString(item, "slug");

      if (!slug) continue;

      // The product name is the friendlier label but is not guaranteed to be
      // present, so the slug is the fallback identity.
      const label = readString(item, "name") ?? slug;

      products.set(label, (products.get(label) ?? 0) + 1);
    }

    const campaign =
      event.campaign && typeof event.campaign === "object"
        ? (event.campaign as Record<string, unknown>)
        : {};

    const source =
      readString(campaign, "utm_source") ?? readString(campaign, "ref");

    sources.set(source ?? "Direct", (sources.get(source ?? "Direct") ?? 0) + 1);

    if (event.entryPath) {
      paths.set(event.entryPath, (paths.get(event.entryPath) ?? 0) + 1);
    }
  }

  return {
    last7Days,
    last30Days,
    productsAsked: products.size,
    shortlist,
    singleProduct,
    topEntryPaths: rank(paths, limit),
    topProducts: rank(products, limit),
    topSources: rank(sources, limit),
    total: events.length,
  };
}
