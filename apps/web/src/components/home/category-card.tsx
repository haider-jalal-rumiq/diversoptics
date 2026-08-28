import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import type { CatalogCategory } from "@/features/catalog/domain/types";

export function CategoryCard({ category }: { category: CatalogCategory }) {
  return (
    <Link
      className="group flex min-h-[340px] min-w-[17.25rem] flex-1 flex-col overflow-hidden rounded-xl border border-porcelain/50 bg-obsidian p-[15px] text-porcelain shadow-card transition-[transform,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-orbit-gold motion-safe:hover:-translate-y-1 sm:min-w-0"
      href={category.href as Route}
    >
      <div className="relative h-44 overflow-hidden rounded-lg bg-charcoal">
        <div className="absolute inset-y-0 left-[13%] right-[13%]">
          <Image alt="" fill sizes="244px" src="/orbit/category-orbit.svg" />
        </div>
        <div className="absolute inset-y-[16%] left-1/4 right-1/4">
          <Image
            alt=""
            fill
            sizes="120px"
            src="/orbit/category-orbit-shadow.svg"
          />
        </div>
        <p className="absolute inset-0 grid place-items-center px-8 text-center text-[10px] font-semibold leading-4">
          CMS CATEGORY IMAGE
        </p>
      </div>
      <div className="flex flex-1 flex-col pt-5">
        <p className="text-[11px] font-semibold tracking-[0.06em] text-porcelain/65">
          {category.eyebrow}
        </p>
        <h3 className="mt-1 font-display text-[1.75rem] leading-none">
          {category.name}
        </h3>
        <p className="mt-3 text-sm leading-5 text-porcelain/70">
          {category.description}
        </p>
        <span className="mt-auto pt-4 text-sm font-semibold text-orbit-gold group-hover:underline">
          Explore category
        </span>
      </div>
    </Link>
  );
}
