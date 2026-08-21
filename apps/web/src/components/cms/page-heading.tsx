import type { ReactNode } from "react";

export function PageHeading({
  action,
  description,
  eyebrow = "Catalog workspace",
  title,
}: {
  action?: ReactNode;
  description: string;
  eyebrow?: string;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-5 border-b border-smoke/15 pb-7 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-bold tracking-[0.18em] text-brass-ink uppercase">
          {eyebrow}
        </p>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-smoke">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}
