"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * The facets inside are server-rendered links, so filtering works with this
 * drawer closed or with JavaScript unavailable. Radix supplies only the focus
 * trap and restore that docs/04 requires of a modal drawer.
 *
 * Applying a filter is a navigation, and the drawer would otherwise stay open on
 * top of the results the visitor just changed. Keying the dialog on the current
 * URL remounts it closed once navigation completes, which reveals the new list
 * without needing a state-setting effect.
 */
export function CatalogFilterDrawer({
  activeCount,
  children,
}: {
  activeCount: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <Dialog.Root key={`${pathname}?${searchParams.toString()}`}>
      <Dialog.Trigger asChild>
        <button
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-obsidian px-4 text-sm font-semibold lg:hidden"
          type="button"
        >
          Filters
          {activeCount > 0 ? (
            <span className="grid size-5 place-items-center rounded-full bg-orbit-gold text-[10px]">
              {activeCount}
            </span>
          ) : null}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-obsidian/60 backdrop-blur-sm lg:hidden" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-[min(90vw,22rem)] flex-col overflow-y-auto bg-porcelain p-6 shadow-2xl lg:hidden">
          <div className="flex items-center justify-between border-b border-smoke/30 pb-4">
            <Dialog.Title className="font-display text-3xl">
              Filters
            </Dialog.Title>
            <Dialog.Close className="min-h-11 rounded-full px-4 text-sm font-semibold">
              Close
            </Dialog.Close>
          </div>
          <div className="mt-6">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
