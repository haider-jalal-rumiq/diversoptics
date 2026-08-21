import type { StoreOpeningHours } from "./types";

const DAY_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function readTime(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();

  // Only an unambiguous 24-hour time is accepted. Anything else is treated as
  // unconfirmed rather than reformatted into something that looks verified.
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(trimmed) ? trimmed : null;
}

/**
 * `business_hours` is free-form jsonb that the CMS does not yet edit, so its shape
 * cannot be assumed. Both an ordered array and a day-keyed object are accepted,
 * and anything unrecognised yields no hours at all — the store page then shows an
 * explicit "not confirmed" state instead of inventing opening times.
 */
export function parseBusinessHours(
  value: unknown,
): readonly StoreOpeningHours[] {
  if (!value || typeof value !== "object") return [];

  const entries: StoreOpeningHours[] = [];

  const push = (day: string, raw: unknown) => {
    if (!raw || typeof raw !== "object") return;

    const record = raw as Record<string, unknown>;
    const opens = readTime(record.opens);
    const closes = readTime(record.closes);
    const closed =
      record.closed === true || (opens === null && closes === null);

    entries.push({ closed, closes, day: titleCase(day), opens });
  };

  if (Array.isArray(value)) {
    for (const item of value) {
      if (!item || typeof item !== "object") continue;

      const record = item as Record<string, unknown>;
      const day = typeof record.day === "string" ? record.day : null;

      if (!day) continue;

      push(day, record);
    }

    return entries;
  }

  const record = value as Record<string, unknown>;

  for (const day of DAY_ORDER) {
    if (day in record) push(day, record[day]);
  }

  return entries;
}
