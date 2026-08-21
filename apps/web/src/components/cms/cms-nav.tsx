import Link from "next/link";

import { BrandMark } from "@/components/brand/brand-mark";
import type { CurrentStaff } from "@/features/cms/auth/staff";

const links = [
  { href: "/cms", label: "Overview" },
  { href: "/cms/products", label: "Products" },
  { href: "/cms/brands", label: "Brands" },
  { href: "/cms/categories", label: "Categories" },
  { href: "/cms/collections", label: "Collections" },
  { href: "/cms/pages", label: "Pages" },
  { href: "/cms/media", label: "Media" },
  { href: "/cms/settings", label: "Settings" },
] as const;

export function CmsNav({ staff }: { staff: CurrentStaff }) {
  return (
    <aside className="border-b border-white/10 bg-charcoal text-white lg:sticky lg:top-0 lg:h-screen lg:border-r lg:border-b-0">
      <div className="flex min-h-20 items-center justify-between px-5 lg:block lg:px-7 lg:pt-7">
        <BrandMark className="border-white/25" />
        <div className="hidden lg:mt-10 lg:block">
          <p className="text-xs font-bold tracking-[0.18em] text-orbit-gold uppercase">
            Catalog CMS
          </p>
          <p className="mt-2 truncate text-sm text-white/65">
            {staff.displayName ?? staff.email ?? "Staff member"}
          </p>
          <p className="mt-1 text-xs text-white/40 capitalize">{staff.role}</p>
        </div>
      </div>

      <nav
        aria-label="CMS"
        className="overflow-x-auto px-4 pb-4 lg:mt-8 lg:px-5"
      >
        <ul className="flex min-w-max gap-1 lg:min-w-0 lg:flex-col">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                className="flex min-h-11 items-center rounded-xl px-4 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white"
                href={{ pathname: link.href }}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
