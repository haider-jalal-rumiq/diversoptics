import "server-only";

import { createClient } from "@/lib/supabase/server";

import {
  summarizeInquiries,
  type InquiryEventRecord,
  type InquirySummary,
} from "@/features/cms/domain/inquiry-metrics";

/**
 * A reporting screen does not need the whole history, and an unbounded read on a
 * table that grows with every click would get slower forever.
 */
const MAX_EVENTS = 500;
const RECENT_ROWS = 20;

export type RecentInquiry = {
  createdAt: string;
  entryPath: string | null;
  eventType: string;
  products: readonly string[];
  publicId: string;
  source: string;
};

export type InquiryReport = {
  recent: readonly RecentInquiry[];
  sampleSize: number;
  summary: InquirySummary;
  truncated: boolean;
};

function productLabels(snapshot: unknown): readonly string[] {
  if (!Array.isArray(snapshot)) return [];

  return snapshot.flatMap((item) => {
    if (!item || typeof item !== "object") return [];

    const record = item as Record<string, unknown>;
    const name = typeof record.name === "string" ? record.name : null;
    const slug = typeof record.slug === "string" ? record.slug : null;
    const label = name ?? slug;

    return label ? [label] : [];
  });
}

function sourceLabel(campaign: unknown): string {
  if (!campaign || typeof campaign !== "object") return "Direct";

  const record = campaign as Record<string, unknown>;
  const value =
    typeof record.utm_source === "string"
      ? record.utm_source
      : typeof record.ref === "string"
        ? record.ref
        : null;

  return value?.trim() ? value.trim() : "Direct";
}

/**
 * Staff-only reporting over recorded inquiry events. RLS already restricts this
 * table to staff, and `anonymous_session_hash` is never selected: the report is
 * about products and campaigns, not about following individual visitors.
 *
 * The clock is read here rather than in the page, because a Server Component body
 * must stay pure. It is read once per request so the rolling windows cannot drift
 * between the summary and the table, and `summarizeInquiries` still takes the
 * timestamp as an argument so it remains deterministic under test.
 */
export async function getInquiryReport(): Promise<InquiryReport> {
  const now = Date.now();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inquiry_events")
    .select(
      "public_id, event_type, catalog_snapshot, campaign, entry_path, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(MAX_EVENTS);

  if (error) {
    throw new Error(`Could not load inquiry events: ${error.message}`);
  }

  const rows = data ?? [];

  const events: InquiryEventRecord[] = rows.map((row) => ({
    campaign: row.campaign,
    catalogSnapshot: row.catalog_snapshot,
    createdAt: row.created_at,
    entryPath: row.entry_path,
    eventType: row.event_type,
    publicId: row.public_id,
  }));

  return {
    recent: rows.slice(0, RECENT_ROWS).map((row) => ({
      createdAt: row.created_at,
      entryPath: row.entry_path,
      eventType: row.event_type,
      products: productLabels(row.catalog_snapshot),
      publicId: row.public_id,
      source: sourceLabel(row.campaign),
    })),
    sampleSize: rows.length,
    summary: summarizeInquiries(events, now),
    truncated: rows.length === MAX_EVENTS,
  };
}
