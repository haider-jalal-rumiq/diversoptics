export const BUSINESS_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export type BusinessDay = (typeof BUSINESS_DAYS)[number];

export type BusinessHoursDayInput = {
  closed: boolean;
  closes: string;
  opens: string;
};

export type BusinessHoursFormInput = Partial<
  Record<BusinessDay, BusinessHoursDayInput>
>;

/**
 * Narrow enough to satisfy the generated `Json` column type, so the payload can
 * be written straight to `site_settings.business_hours` without a cast.
 */
export type StoredBusinessHours = Record<
  string,
  { closed: true } | { closes: string; opens: string }
>;

export type BusinessHoursResult =
  | { ok: true; value: StoredBusinessHours | null }
  | { ok: false; errors: readonly string[] };

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

function label(day: BusinessDay): string {
  return day.charAt(0).toUpperCase() + day.slice(1);
}

function toMinutes(time: string): number {
  const [hours = "0", minutes = "0"] = time.split(":");

  return Number(hours) * 60 + Number(minutes);
}

/**
 * Turns the settings form's seven day rows into the `site_settings.business_hours`
 * payload the public store page reads.
 *
 * A day the owner left blank is omitted entirely rather than stored as closed,
 * because "we have not confirmed this yet" and "we are shut that day" are
 * different facts and AGENTS.md forbids publishing an unconfirmed one as if it
 * were verified. The store page shows nothing at all until at least one day is
 * filled in.
 */
export function buildBusinessHours(
  input: BusinessHoursFormInput,
): BusinessHoursResult {
  const errors: string[] = [];
  const value: StoredBusinessHours = {};

  for (const day of BUSINESS_DAYS) {
    const entry = input[day];

    if (!entry) continue;

    const opens = entry.opens.trim();
    const closes = entry.closes.trim();

    if (entry.closed) {
      // An explicit closed day is a confirmed fact worth publishing, and any
      // times typed before ticking the box are discarded rather than stored.
      value[day] = { closed: true };
      continue;
    }

    if (!opens && !closes) continue;

    if (!opens || !closes) {
      errors.push(
        `${label(day)} needs both an opening and a closing time, or mark it closed.`,
      );
      continue;
    }

    if (!TIME_PATTERN.test(opens) || !TIME_PATTERN.test(closes)) {
      errors.push(`${label(day)} needs 24-hour times such as 11:00 and 21:00.`);
      continue;
    }

    if (toMinutes(closes) <= toMinutes(opens)) {
      errors.push(`${label(day)} must close after it opens.`);
      continue;
    }

    value[day] = { closes, opens };
  }

  if (errors.length > 0) return { errors, ok: false };

  // Null rather than an empty object, so the column reads as "never set".
  return { ok: true, value: Object.keys(value).length > 0 ? value : null };
}

export type BusinessHoursRow = {
  closed: boolean;
  closes: string;
  day: BusinessDay;
  opens: string;
};

/**
 * Reads the stored payload back into seven form rows. Anything unrecognised
 * yields empty fields, so a hand-edited column cannot put invalid times into the
 * form and straight back into the database.
 */
export function toBusinessHoursRows(
  stored: unknown,
): readonly BusinessHoursRow[] {
  const record =
    stored && typeof stored === "object" && !Array.isArray(stored)
      ? (stored as Record<string, unknown>)
      : {};

  return BUSINESS_DAYS.map((day) => {
    const entry = record[day];

    if (!entry || typeof entry !== "object") {
      return { closed: false, closes: "", day, opens: "" };
    }

    const fields = entry as Record<string, unknown>;
    const opens = typeof fields.opens === "string" ? fields.opens : "";
    const closes = typeof fields.closes === "string" ? fields.closes : "";

    return {
      closed: fields.closed === true,
      closes: TIME_PATTERN.test(closes) ? closes : "",
      day,
      opens: TIME_PATTERN.test(opens) ? opens : "",
    };
  });
}
