"use client";

import * as Dialog from "@radix-ui/react-dialog";
import type { Route } from "next";
import Link from "next/link";

import { AssetIcon } from "@/components/ui/asset-icon";
import { siteConfig } from "@/lib/config/site";

import type { HeaderNavItem } from "./site-header";

/**
 * docs/04 keeps the first mobile level to the main shopping tasks, so brand,
 * shape and fit taxonomies stay inside category pages rather than in this menu.
 */
const SECONDARY_LINKS: readonly HeaderNavItem[] = [
  { href: "/new-and-featured", label: "New & featured" },
  { href: "/brands", label: "Brands" },
  { href: "/shortlist", label: "Shortlist" },
  { href: "/guides", label: "Guides" },
  { href: "/store", label: "F-11 store" },
];

export function MobileMenu({
  navigation = siteConfig.navigation,
  whatsappHref,
}: {
  navigation?: readonly HeaderNavItem[];
  whatsappHref: string;
}) {
  const items = [...navigation, ...SECONDARY_LINKS];

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          aria-label="Open navigation"
          className="grid size-12 place-items-center rounded-full bg-white text-obsidian lg:hidden"
          type="button"
        >
          <AssetIcon name="menu" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-obsidian/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-[min(90vw,24rem)] flex-col overflow-y-auto bg-porcelain p-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-smoke/30 pb-5">
            <Dialog.Title className="font-display text-3xl">
              Browse Diverso
            </Dialog.Title>
            <Dialog.Close className="min-h-11 rounded-full px-4 text-sm font-semibold">
              Close
            </Dialog.Close>
          </div>
          <nav aria-label="Mobile navigation" className="mt-8 flex flex-col">
            {items.map((item) => (
              <Dialog.Close asChild key={`${item.label}-${item.href}`}>
                <Link
                  className="border-b border-smoke/25 py-5 text-lg font-semibold"
                  href={item.href as Route}
                >
                  {item.label}
                </Link>
              </Dialog.Close>
            ))}
          </nav>
          <a
            className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-signal-green px-5 text-sm font-semibold text-white"
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
