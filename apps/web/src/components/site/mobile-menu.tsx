"use client";

import * as Dialog from "@radix-ui/react-dialog";
import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";

import { AssetIcon } from "@/components/ui/asset-icon";
import { catalogNavigation } from "@/lib/config/catalog-navigation";
import { cn } from "@/lib/utils/cn";

import type { HeaderNavItem } from "./site-header";

/** Secondary destinations stay compact so the requested catalog taxonomy owns
 * the first level of the mobile menu. */
const SECONDARY_LINKS: readonly HeaderNavItem[] = [
  { href: "/new-and-featured", label: "New & featured" },
  { href: "/brands", label: "Brands" },
  { href: "/shortlist", label: "Shortlist" },
  { href: "/guides", label: "Guides" },
  { href: "/store", label: "F-11 store" },
];

export function MobileMenu({ whatsappHref }: { whatsappHref: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          aria-label="Open navigation"
          className="grid size-11 place-items-center rounded-full bg-orbit-gold text-obsidian xl:hidden"
          type="button"
        >
          <AssetIcon name="menu" size={21} />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-obsidian/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-[min(92vw,27rem)] flex-col overflow-y-auto border-l border-orbit-gold/20 bg-obsidian p-5 text-porcelain shadow-2xl sm:p-7">
          <div className="flex items-center justify-between border-b border-porcelain/12 pb-5">
            <Dialog.Title className="font-display text-[2rem] leading-none">
              Browse Diverso
            </Dialog.Title>
            <Dialog.Close className="min-h-11 rounded-full border border-porcelain/20 px-4 text-xs font-bold uppercase tracking-[0.1em] text-porcelain/75">
              Close
            </Dialog.Close>
          </div>
          <nav aria-label="Mobile navigation" className="mt-4 flex flex-col">
            {catalogNavigation.map((item, index) => {
              const open = openIndex === index;
              const contentId = `mobile-${item.label.toLowerCase().replaceAll(" ", "-")}`;

              return (
                <div className="border-b border-porcelain/10" key={item.label}>
                  <button
                    aria-controls={contentId}
                    aria-expanded={open}
                    className="flex min-h-14 w-full items-center justify-between gap-4 py-3 text-left text-base font-semibold"
                    onClick={() => setOpenIndex(open ? null : index)}
                    type="button"
                  >
                    {item.label}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "dx-mobile-chevron text-orbit-gold",
                        open && "dx-mobile-chevron-open",
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      "dx-mobile-group-content",
                      open && "dx-mobile-group-content-open",
                    )}
                    id={contentId}
                  >
                    <div>
                      <p className="pb-4 text-sm leading-6 text-porcelain/65">
                        {item.description}
                      </p>
                      <div className="grid gap-5 pb-6">
                        {item.sections.map((section) => (
                          <section key={section.heading}>
                            <h2 className="text-[10px] font-bold uppercase tracking-[0.16em] text-orbit-gold">
                              {section.heading}
                            </h2>
                            <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                              {section.links.map((link) => (
                                <li key={`${section.heading}-${link.label}`}>
                                  <Dialog.Close asChild>
                                    <Link
                                      className="inline-flex min-h-9 items-center text-sm text-porcelain/78"
                                      href={link.href as Route}
                                    >
                                      {link.label}
                                    </Link>
                                  </Dialog.Close>
                                </li>
                              ))}
                            </ul>
                          </section>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="grid grid-cols-2 gap-x-4 border-b border-porcelain/10 py-5">
              {SECONDARY_LINKS.map((item) => (
                <Dialog.Close asChild key={`${item.label}-${item.href}`}>
                  <Link
                    className="inline-flex min-h-10 items-center text-sm font-semibold text-porcelain/70"
                    href={item.href as Route}
                  >
                    {item.label}
                  </Link>
                </Dialog.Close>
              ))}
            </div>
          </nav>
          <a
            className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-signal-green px-5 text-sm font-semibold text-white"
            href={whatsappHref}
          >
            <AssetIcon name="message" />
            Ask on WhatsApp
          </a>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
