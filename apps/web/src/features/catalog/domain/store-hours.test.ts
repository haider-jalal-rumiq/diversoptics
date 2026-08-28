import { describe, expect, it } from "vitest";

import { parseBusinessHours, summariseBusinessHours } from "./store-hours";

const everyDay = {
  friday: { closes: "22:00", opens: "11:00" },
  monday: { closes: "22:00", opens: "11:00" },
  saturday: { closes: "22:00", opens: "11:00" },
  sunday: { closes: "22:00", opens: "11:00" },
  thursday: { closes: "22:00", opens: "11:00" },
  tuesday: { closes: "22:00", opens: "11:00" },
  wednesday: { closes: "22:00", opens: "11:00" },
};

function without(day: keyof typeof everyDay) {
  const copy: Partial<typeof everyDay> = { ...everyDay };
  delete copy[day];
  return copy;
}

describe("summariseBusinessHours", () => {
  it("collapses a full week on identical times into one line", () => {
    expect(summariseBusinessHours(parseBusinessHours(everyDay))).toBe(
      "Open daily 11:00 – 22:00",
    );
  });

  it("renders a contiguous run as a day range", () => {
    expect(summariseBusinessHours(parseBusinessHours(without("sunday")))).toBe(
      "Mon–Sat 11:00 – 22:00",
    );
  });

  it("refuses to summarise a week with a gap in the middle", () => {
    // Mon–Sat with Wednesday missing must not read as an unbroken range.
    expect(
      summariseBusinessHours(parseBusinessHours(without("wednesday"))),
    ).toBeNull();
  });

  it("refuses to summarise days that differ", () => {
    const mixed = {
      ...everyDay,
      saturday: { closes: "18:00", opens: "12:00" },
    };

    expect(summariseBusinessHours(parseBusinessHours(mixed))).toBeNull();
  });

  it("returns null when nothing is confirmed", () => {
    expect(summariseBusinessHours([])).toBeNull();
    expect(summariseBusinessHours(parseBusinessHours({}))).toBeNull();
  });
});
