import type { Route } from "next";
import Link from "next/link";

import { BrandMark } from "@/components/brand/brand-mark";
import { ShortlistCountBadge } from "@/components/catalog/shortlist-button";
import { AssetIcon } from "@/components/ui/asset-icon";
import { Container } from "@/components/ui/container";
import { catalogNavigation } from "@/lib/config/catalog-navigation";
import { buildGeneralWhatsAppHref } from "@/lib/config/site";
import { cn } from "@/lib/utils/cn";

import { MobileMenu } from "./mobile-menu";

export type HeaderNavItem = { href: string; label: string };

const SECTION_GRID_CLASS = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
} as const;

export function SiteHeader() {
  const whatsappHref = buildGeneralWhatsAppHref();

  return (
    <header className="dx-site-header sticky top-0 z-40 border-b border-orbit-gold/20 text-porcelain">
      <Container className="relative flex h-[72px] items-center gap-4 px-5 sm:px-8 xl:h-[76px] xl:px-10">
        <BrandMark className="h-11 w-[92px] shrink-0 sm:h-12 sm:w-[104px]" />

        <nav
          aria-label="Primary navigation"
          className="dx-mega-nav relative hidden min-w-0 flex-1 items-stretch justify-center xl:flex"
        >
          {catalogNavigation.map((item) => (
            <div
              className="dx-nav-group static flex items-stretch"
              key={item.label}
            >
              <Link
                className="dx-nav-trigger relative inline-flex min-h-11 items-center px-3 text-[12px] font-semibold tracking-[0.01em] text-porcelain/80 2xl:px-4 2xl:text-[13px]"
                href={item.href as Route}
              >
                {item.label}
              </Link>

              <div className="dx-mega-panel absolute left-1/2 top-full w-[min(58rem,calc(100vw-3rem))] pt-4">
                <div
                  aria-label={`${item.label} menu`}
                  className="dx-mega-panel-card grid gap-7 rounded-2xl border border-orbit-gold/20 p-6 shadow-[0_28px_80px_rgb(0_0_0/0.38)]"
                  role="navigation"
                >
                  <div className="border-b border-porcelain/10 pb-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-orbit-gold">
                      Browse {item.label}
                    </p>
                    <div className="mt-3 flex items-end justify-between gap-6">
                      <p className="max-w-[34rem] font-display text-[1.7rem] leading-tight text-porcelain">
                        {item.description}
                      </p>
                      <Link
                        className="dx-mega-all-link shrink-0 text-xs font-bold uppercase tracking-[0.12em] text-orbit-gold"
                        href={item.href as Route}
                      >
                        View all
                        <span aria-hidden="true"> →</span>
                      </Link>
                    </div>
                  </div>

                  <div
                    className={cn(
                      "grid gap-x-8 gap-y-7",
                      SECTION_GRID_CLASS[
                        Math.min(item.sections.length, 3) as 1 | 2 | 3
                      ],
                    )}
                  >
                    {item.sections.map((section) => (
                      <section key={section.heading}>
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.16em] text-porcelain/65">
                          {section.heading}
                        </h2>
                        <ul className="mt-3 grid grid-cols-2 gap-x-5 gap-y-1.5">
                          {section.links.map((link) => (
                            <li key={`${section.heading}-${link.label}`}>
                              <Link
                                className="dx-mega-link inline-flex min-h-8 items-center text-[13px] font-medium text-porcelain/78"
                                href={link.href as Route}
                              >
                                {link.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </section>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link
            aria-label="Search the catalog"
            className="dx-header-icon grid size-11 place-items-center rounded-full text-porcelain"
            href="/search"
          >
            <AssetIcon name="search" size={21} />
          </Link>
          <Link
            aria-label="View your shortlist"
            className="dx-header-icon relative grid size-11 place-items-center rounded-full text-porcelain"
            href="/shortlist"
          >
            <AssetIcon name="heart" size={21} />
            <ShortlistCountBadge />
          </Link>
          <a
            className="dx-whatsapp-button hidden min-h-11 items-center justify-center gap-2 rounded-full bg-signal-green px-4 text-xs font-bold text-white xl:inline-flex 2xl:px-5 2xl:text-sm"
            href={whatsappHref}
          >
            <AssetIcon name="message" size={20} />
            <span className="hidden 2xl:inline">Ask on WhatsApp</span>
            <span className="2xl:hidden">WhatsApp</span>
          </a>
          <MobileMenu whatsappHref={whatsappHref} />
        </div>
      </Container>
    </header>
  );
}
