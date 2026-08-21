import Link from "next/link";

import { PageHeading } from "@/components/cms/page-heading";
import { Button } from "@/components/ui/button";
import { getCurrentStaff, canEditCatalog } from "@/features/cms/auth/staff";
import { getCmsDashboardData } from "@/features/cms/data/dashboard";

const dateFormatter = new Intl.DateTimeFormat("en-PK", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Karachi",
});

export default async function CmsDashboardPage() {
  const [data, staff] = await Promise.all([
    getCmsDashboardData(),
    getCurrentStaff(),
  ]);

  return (
    <>
      <PageHeading
        action={
          staff && canEditCatalog(staff.role) ? (
            <Button asChild>
              <Link href="/cms/products/new">Add product</Link>
            </Button>
          ) : undefined
        }
        description="A calm operational view of catalog readiness, publishing, and recent changes."
        title="Overview"
      />

      <section
        aria-label="Catalog summary"
        className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {[
          ["All products", data.counts.products],
          ["Published", data.counts.publishedProducts],
          ["Brands", data.counts.brands],
          ["Media items", data.counts.media],
        ].map(([label, value]) => (
          <article
            className="rounded-card border border-smoke/15 bg-white p-6 shadow-card"
            key={label}
          >
            <p className="text-sm text-smoke">{label}</p>
            <p className="mt-3 font-display text-5xl">{value}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-card border border-smoke/15 bg-white p-6 shadow-card sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl">Recent activity</h2>
            <p className="mt-2 text-sm text-smoke">
              Privacy-minimized audit events from catalog changes.
            </p>
          </div>
        </div>

        {data.auditEvents.length ? (
          <ul className="mt-6 divide-y divide-smoke/15">
            {data.auditEvents.map((event) => (
              <li
                className="flex flex-col gap-1 py-4 text-sm sm:flex-row sm:items-center sm:justify-between"
                key={event.id}
              >
                <span>
                  <strong className="capitalize">{event.operation}</strong>
                  <span className="text-smoke"> on {event.tableName}</span>
                </span>
                <time className="text-xs text-smoke" dateTime={event.createdAt}>
                  {dateFormatter.format(new Date(event.createdAt))}
                </time>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 rounded-xl bg-porcelain p-5 text-sm text-smoke">
            No staff catalog changes yet. The initial secure configuration is
            intentionally excluded from this activity view.
          </p>
        )}
      </section>
    </>
  );
}
