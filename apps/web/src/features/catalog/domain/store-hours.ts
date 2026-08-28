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

/**
 * Collapses opening hours into a single line for the footer, where the full
 * seven-row table the store page renders would not fit.
 *
 * Only the two patterns that can be stated unambiguously in one line are
 * summarised: every day open on the same times, or a contiguous run of days on
 * the same times. Anything more irregular returns null and the caller shows
 * nothing, because a footer is the wrong place to approximate a shop's hours and
 * the store page already lists them in full.
 */
export function summariseBusinessHours(
  entries: readonly StoreOpeningHours[],
): string | null {
  const open = entries.filter(
    (entry) => !entry.closed && entry.opens && entry.closes,
  );

  const first = open[0];
  if (!first?.opens || !first.closes) return null;

  const { closes, opens } = first;
  if (
    !open.every((entry) => entry.opens === opens && entry.closes === closes)
  ) {
    return null;
  }

  const window = `${opens} – ${closes}`;
  if (open.length === DAY_ORDER.length) return `Open daily ${window}`;

  // Contiguity is checked against the canonical week order, so a run that wraps
  // or skips a day in the middle is reported as unsummarisable rather than
  // flattened into a range that would read as covering the gap.
  const indexes: number[] = [];

  for (const entry of open) {
    const index = DAY_ORDER.indexOf(
      entry.day.toLowerCase() as (typeof DAY_ORDER)[number],
    );

    if (index < 0) return null;

    indexes.push(index);
  }

  indexes.sort((a, b) => a - b);

  const start = indexes.at(0);
  const end = indexes.at(-1);

  if (start === undefined || end === undefined) return null;
  if (end - start !== indexes.length - 1) return null;

  const startDay = DAY_ORDER[start];
  const endDay = DAY_ORDER[end];

  if (!startDay || !endDay) return null;

  const startLabel = titleCase(startDay).slice(0, 3);
  const endLabel = titleCase(endDay).slice(0, 3);

  return start === end
    ? `${startLabel} ${window}`
    : `${startLabel}–${endLabel} ${window}`;
}
