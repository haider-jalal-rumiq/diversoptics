import type { Route } from "next";
import Link from "next/link";

import { BrandMark } from "@/components/brand/brand-mark";
import { ShortlistCountBadge } from "@/components/catalog/shortlist-button";
import { AssetIcon } from "@/components/ui/asset-icon";
import { Container } from "@/components/ui/container";
import { buildGeneralWhatsAppHref, siteConfig } from "@/lib/config/site";

import { MobileMenu } from "./mobile-menu";

export type HeaderNavItem = { href: string; label: string };

export function SiteHeader({
  navigation = siteConfig.navigation,
}: {
  /** Defaults to the static links; catalog pages pass the published categories. */
  navigation?: readonly HeaderNavItem[];
}) {
  const whatsappHref = buildGeneralWhatsAppHref();

  return (
    <>
      <div className="bg-orbit-gold px-4 py-2.5 text-center text-[11px] font-semibold tracking-[0.08em] text-obsidian sm:text-xs">
        DELIVERY AVAILABLE · COVERAGE AND TIMING CONFIRMED ON INQUIRY
      </div>
      <header className="bg-porcelain py-2">
        <Container className="flex h-[72px] items-center gap-3 rounded-none bg-white px-3 sm:h-[88px] sm:gap-[18px] sm:px-6 lg:max-w-[70rem]">
          <Link aria-label="Diverso Optics home" href="/">
            <BrandMark className="h-12 w-[82px] sm:h-16 sm:w-[108px]" />
          </Link>
          <nav
            aria-label="Primary navigation"
            className="hidden min-w-0 flex-1 items-center gap-5 lg:flex"
          >
            {navigation.map((item) => (
              <Link
                className="text-[13px] font-medium hover:underline"
                href={item.href as Route}
                key={`${item.label}-${item.href}`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              className="text-[13px] font-medium hover:underline"
              href="/brands"
            >
              Brands
            </Link>
            <Link
              className="text-[13px] font-medium hover:underline"
              href="/store"
            >
              F-11 Store
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <Link
              aria-label="Search the catalog"
              className="grid size-12 place-items-center rounded-full"
              href="/search"
            >
              <AssetIcon name="search" />
            </Link>
            <Link
              aria-label="View your shortlist"
              className="relative grid size-12 place-items-center rounded-full"
              href="/shortlist"
            >
              <AssetIcon name="heart" />
              <ShortlistCountBadge />
            </Link>
            <a
              className="hidden min-h-[52px] items-center justify-center gap-2 rounded-lg bg-signal-green px-4 text-sm font-semibold text-white lg:inline-flex"
              href={whatsappHref}
            >
              <AssetIcon name="message" />
              Ask on WhatsApp
            </a>
            <MobileMenu navigation={navigation} whatsappHref={whatsappHref} />
          </div>
        </Container>
      </header>
    </>
  );
}
