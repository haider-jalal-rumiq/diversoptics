import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import type { CatalogBrand } from "@/features/catalog/domain/types";

export function BrandTile({ brand }: { brand: CatalogBrand }) {
  return (
    <Link
      className="flex min-h-44 min-w-64 flex-1 flex-col items-center justify-center rounded-xl border border-porcelain/50 bg-charcoal px-5 text-center text-porcelain shadow-card sm:min-w-0"
      href={brand.href as Route}
    >
      <div className="relative size-16">
        <Image alt="" fill sizes="64px" src="/orbit/brand-orbit.svg" />
        <span className="absolute inset-0 grid place-items-center text-[8px] font-semibold">
          BRAND
        </span>
      </div>
      <h3 className="mt-3 text-lg font-semibold uppercase">{brand.name}</h3>
      {/*
        A brand's category mix is derived from its products, so the label is only
        shown when it actually holds a value rather than guessed at.
      */}
      {brand.categoryLabel ? (
        <p className="mt-1 text-xs text-porcelain/65">{brand.categoryLabel}</p>
      ) : (
        <p className="mt-1 text-xs text-porcelain/65">View products</p>
      )}
    </Link>
  );
}
