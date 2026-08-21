"use client";

import { useSyncExternalStore } from "react";

import {
  isShortlisted,
  parseShortlist,
  removeFromShortlist,
  serializeShortlist,
  SHORTLIST_LIMIT,
  SHORTLIST_STORAGE_KEY,
  toggleShortlist,
} from "@/features/catalog/domain/shortlist";
import type { ShortlistEntry } from "@/features/catalog/domain/types";

/**
 * The shortlist is browser storage, which is an external store rather than React
 * state, so it is read through `useSyncExternalStore`. That keeps the server
 * render empty, adopts the stored value on hydration without a state-setting
 * effect, and keeps every consumer in sync from a single source.
 */

const EMPTY: readonly ShortlistEntry[] = [];

const listeners = new Set<() => void>();

/** Snapshots must be referentially stable or React re-renders forever. */
let cachedRaw: string | null = null;
let cachedEntries: readonly ShortlistEntry[] = EMPTY;
let storageUsable = true;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(SHORTLIST_STORAGE_KEY);
  } catch {
    // Private modes and blocked storage must not break the catalog.
    storageUsable = false;

    return null;
  }
}

function getSnapshot(): readonly ShortlistEntry[] {
  // With storage blocked the in-memory value is the only truth available, so
  // re-reading would discard the visitor's selection on every render.
  if (!storageUsable) return cachedEntries;

  const raw = readRaw();

  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedEntries = parseShortlist(raw);
  }

  return cachedEntries;
}

function getServerSnapshot(): readonly ShortlistEntry[] {
  return EMPTY;
}

function emit() {
  for (const listener of listeners) listener();
}

function handleStorage(event: StorageEvent) {
  // A second tab may have changed the shortlist; the badge should agree.
  if (event.key !== null && event.key !== SHORTLIST_STORAGE_KEY) return;

  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  if (listeners.size === 1) {
    window.addEventListener("storage", handleStorage);
  }

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0) {
      window.removeEventListener("storage", handleStorage);
    }
  };
}

function write(next: readonly ShortlistEntry[]) {
  const serialized = serializeShortlist(next);

  try {
    window.localStorage.setItem(SHORTLIST_STORAGE_KEY, serialized);
    cachedRaw = serialized;
  } catch {
    storageUsable = false;
  }

  cachedEntries = next;
  emit();
}

export function toggleShortlistEntry(entry: ShortlistEntry) {
  write(toggleShortlist(getSnapshot(), entry));
}

export function removeShortlistEntry(slug: string) {
  write(removeFromShortlist(getSnapshot(), slug));
}

export function clearShortlist() {
  write(EMPTY);
}

export type ShortlistState = {
  entries: readonly ShortlistEntry[];
  isFull: boolean;
  contains: (slug: string) => boolean;
};

export function useShortlist(): ShortlistState {
  const entries = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  return {
    contains: (slug) => isShortlisted(entries, slug),
    entries,
    isFull: entries.length >= SHORTLIST_LIMIT,
  };
}
