import type { Route } from "next";
import Link from "next/link";

export type BreadcrumbTrail = readonly { href: string | null; label: string }[];

/**
 * Rendered as a list so the visible trail and the BreadcrumbList structured data
 * are generated from one source and cannot disagree.
 */
export function Breadcrumbs({ trail }: { trail: BreadcrumbTrail }) {
  if (trail.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex list-none flex-wrap items-center gap-2 p-0 text-xs text-smoke">
        {trail.map((crumb, index) => {
          const last = index === trail.length - 1;

          return (
            <li
              className="flex items-center gap-2"
              key={`${crumb.label}-${index}`}
            >
              {crumb.href && !last ? (
                <Link className="hover:underline" href={crumb.href as Route}>
                  {crumb.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined}>
                  {crumb.label}
                </span>
              )}
              {last ? null : <span aria-hidden="true">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
