"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";

import { AssetIcon } from "@/components/ui/asset-icon";
import { siteConfig } from "@/lib/config/site";

export function MobileMenu({ whatsappHref }: { whatsappHref: string }) {
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
        <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-[min(90vw,24rem)] flex-col bg-porcelain p-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-smoke/30 pb-5">
            <Dialog.Title className="font-display text-3xl">
              Browse Diverso
            </Dialog.Title>
            <Dialog.Close className="min-h-11 rounded-full px-4 text-sm font-semibold">
              Close
            </Dialog.Close>
          </div>
          <nav aria-label="Mobile navigation" className="mt-8 flex flex-col">
            {siteConfig.navigation.map((item) => (
              <Dialog.Close asChild key={`${item.label}-${item.href}`}>
                <Link
                  className="border-b border-smoke/25 py-5 text-lg font-semibold"
                  href={item.href}
                >
                  {item.label}
                </Link>
              </Dialog.Close>
            ))}
          </nav>
          <a
            className="mt-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-signal-green px-5 text-sm font-semibold text-white"
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
