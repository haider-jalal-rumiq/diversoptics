import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { Container } from "@/components/ui/container";
import { getStoreSettings } from "@/features/catalog/data/store-settings";
import { summariseBusinessHours } from "@/features/catalog/domain/store-hours";
import { siteConfig } from "@/lib/config/site";

import type { HeaderNavItem } from "./site-header";

const EXPLORE_LINKS = [
  { href: "/new-and-featured", label: "New & featured" },
  { href: "/brands", label: "Brands" },
  { href: "/guides", label: "Guides" },
  { href: "/shortlist", label: "Shortlist" },
] as const;

function FooterColumn({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <div className="space-y-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-porcelain/50">
        {title}
      </p>
      <ul className="space-y-2.5 text-sm text-porcelain/70">{children}</ul>
    </div>
  );
}

/**
 * `py-1.5 -my-1.5` grows the link's clickable box to the 24px WCAG 2.2 target
 * size without changing the list's visual rhythm — the negative margin cancels
 * the padding it just added.
 */
const FOOTER_LINK_CLASS = "inline-block -my-1.5 py-1.5 hover:text-porcelain";

function FooterLinks({ links }: { links: readonly HeaderNavItem[] }) {
  return (
    <>
      {links.map(({ href, label }) => (
        <li key={`${label}-${href}`}>
          <Link className={FOOTER_LINK_CLASS} href={href as Route}>
            {label}
          </Link>
        </li>
      ))}
    </>
  );
}

/**
 * Address and hours come from the CMS singleton, the same source the store page
 * reads. They used to be a hard-coded "pending client confirmation" line, which
 * kept claiming the facts were missing long after the owner had entered them.
 *
 * Anything still unset stays absent rather than being filled with a plausible
 * value, so the footer can never assert an address or an opening time the shop
 * has not confirmed.
 */
export async function SiteFooter({
  navigation = siteConfig.navigation,
}: {
  /** Defaults to the static links; catalog pages pass the published categories. */
  navigation?: readonly HeaderNavItem[];
}) {
  const settings = await getStoreSettings();
  const address = settings?.fullAddress ?? null;
  const hours = summariseBusinessHours(settings?.businessHours ?? []);
  const phone = settings?.phoneNumber ?? null;

  return (
    <footer className="relative overflow-hidden bg-obsidian pb-6 pt-16 text-porcelain">
      {/*
        The wordmark sits behind the columns rather than below them, the same
        layering the hero uses for its own DIVERSO — a backdrop, not a section
        of its own. It gets the same warm glow the hero puts behind its
        wordmark, not just for the brand echo: a flat obsidian backdrop makes
        the low-opacity glyphs fail contrast tooling outright, where the hero's
        glow reads as a gradient and is exempt as decorative background text.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[26vw] bg-[radial-gradient(ellipse_at_center,rgba(254,204,41,0.16)_0%,rgba(168,121,42,0.08)_45%,transparent_75%)]"
      />
      <p
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 select-none whitespace-nowrap text-center font-display text-[19vw] leading-[0.72] tracking-[-0.05em] text-porcelain/[0.09]"
      >
        DIVERSO
      </p>

      <Container className="relative z-10 grid gap-x-8 gap-y-12 lg:grid-cols-[1.3fr_repeat(4,1fr)]">
        <div className="max-w-xs space-y-4">
          <p className="font-display text-2xl tracking-tight">DIVERSO</p>
          <p className="text-sm leading-6 text-porcelain/65">
            {siteConfig.description}
          </p>
        </div>

        <FooterColumn title="Shop">
          <FooterLinks links={navigation} />
        </FooterColumn>

        <FooterColumn title="Explore">
          <FooterLinks links={EXPLORE_LINKS} />
        </FooterColumn>

        <FooterColumn title="Store">
          <li>
            {address ?? settings?.locationLabel ?? siteConfig.locationLabel}
          </li>
          {hours ? <li>{hours}</li> : null}
          {phone ? (
            <li>
              <a
                className={FOOTER_LINK_CLASS}
                href={`tel:${phone.replace(/\s+/g, "")}`}
              >
                {phone}
              </a>
            </li>
          ) : null}
        </FooterColumn>

        <FooterColumn title="Social">
          {siteConfig.social.map(({ href, label, name }) =>
            href ? (
              <li key={name}>
                <a
                  className={FOOTER_LINK_CLASS}
                  href={href}
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  {label}
                </a>
              </li>
            ) : (
              <li className="text-porcelain/60" key={name}>
                {label}
              </li>
            ),
          )}
        </FooterColumn>
      </Container>

      <Container className="relative z-10 mt-14 flex flex-col gap-2 border-t border-porcelain/10 py-6 text-[11px] font-semibold uppercase tracking-[0.1em] text-porcelain/60 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Diverso Optics. All rights reserved.</p>
        <p>Catalog · Brands · Store · Guides · Policies</p>
      </Container>
    </footer>
  );
}
