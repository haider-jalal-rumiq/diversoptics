import type { Metadata } from "next";

import { PageHeading } from "@/components/cms/page-heading";
import { getInquiryReport } from "@/features/cms/data/inquiries";
import type { InquiryCount } from "@/features/cms/domain/inquiry-metrics";

export const metadata: Metadata = { title: "Inquiries" };

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-card border border-smoke/15 bg-white p-5 shadow-card">
      <p className="text-xs tracking-[0.12em] text-smoke uppercase">{label}</p>
      <p className="mt-2 font-display text-4xl">{value}</p>
    </div>
  );
}

function RankTable({
  caption,
  empty,
  rows,
}: {
  caption: string;
  empty: string;
  rows: readonly InquiryCount[];
}) {
  return (
    <section className="rounded-card border border-smoke/15 bg-white p-6 shadow-card">
      <h2 className="font-display text-2xl">{caption}</h2>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-smoke">{empty}</p>
      ) : (
        <ul className="mt-4 list-none space-y-2 p-0 text-sm">
          {rows.map((row) => (
            <li
              className="flex justify-between gap-4 border-b border-smoke/15 pb-2"
              key={row.label}
            >
              <span className="min-w-0 truncate">{row.label}</span>
              <span className="font-semibold">{row.count}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function InquiriesPage() {
  const report = await getInquiryReport();
  const { summary } = report;

  return (
    <>
      <PageHeading
        description="Recorded WhatsApp inquiry events. Figures cover intent to ask, not confirmed sales, which are recorded by the team after the conversation."
        title="Inquiries"
      />

      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Inquiries (last 7 days)" value={summary.last7Days} />
        <Stat label="Inquiries (last 30 days)" value={summary.last30Days} />
        <Stat label="Single product" value={summary.singleProduct} />
        <Stat label="Shortlist" value={summary.shortlist} />
      </div>

      {summary.total === 0 ? (
        <p className="mt-7 rounded-card border border-smoke/15 bg-white p-6 text-sm leading-6 text-smoke shadow-card">
          No inquiries have been recorded yet. An event is written each time a
          visitor opens WhatsApp from a product page or from their shortlist.
        </p>
      ) : null}

      <div className="mt-7 grid gap-4 lg:grid-cols-3">
        <RankTable
          caption="Most asked about"
          empty="No products have been asked about yet."
          rows={summary.topProducts}
        />
        <RankTable
          caption="Where they came from"
          empty="No campaign sources recorded yet."
          rows={summary.topSources}
        />
        <RankTable
          caption="Pages that started the inquiry"
          empty="No entry paths recorded yet."
          rows={summary.topEntryPaths}
        />
      </div>

      <section className="mt-7 rounded-card border border-smoke/15 bg-white p-6 shadow-card">
        <h2 className="font-display text-2xl">Recent inquiries</h2>
        <p className="mt-2 text-sm leading-6 text-smoke">
          {/*
            The reference is the short id included in the WhatsApp message, so a
            conversation can be matched back to the click that started it. No
            visitor identifier is stored or shown.
          */}
          Match the reference against the “Ref:” line in the WhatsApp
          conversation.
        </p>

        {report.recent.length === 0 ? (
          <p className="mt-4 text-sm text-smoke">Nothing recorded yet.</p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[48rem] text-left text-sm">
              <thead className="border-b border-smoke/20 text-xs tracking-[0.12em] text-smoke uppercase">
                <tr>
                  <th className="px-3 py-3">Reference</th>
                  <th className="px-3 py-3">When</th>
                  <th className="px-3 py-3">Type</th>
                  <th className="px-3 py-3">Products</th>
                  <th className="px-3 py-3">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-smoke/15">
                {report.recent.map((row) => (
                  <tr key={row.publicId}>
                    <td className="px-3 py-4 font-mono text-xs">
                      {row.publicId}
                    </td>
                    <td className="px-3 py-4 text-smoke">
                      {new Date(row.createdAt).toLocaleString("en-PK")}
                    </td>
                    <td className="px-3 py-4">
                      {row.eventType === "shortlist" ? "Shortlist" : "Product"}
                    </td>
                    <td className="px-3 py-4">
                      {row.products.length > 0
                        ? row.products.join(", ")
                        : "Not recorded"}
                    </td>
                    <td className="px-3 py-4 text-smoke">{row.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-4 text-xs leading-5 text-smoke">
          Based on the most recent {report.sampleSize} recorded events
          {report.truncated
            ? ". Older events exist but are not included in these totals."
            : "."}
        </p>
      </section>
    </>
  );
}
