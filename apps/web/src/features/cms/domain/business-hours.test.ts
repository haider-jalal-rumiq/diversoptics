import { describe, expect, it } from "vitest";

import {
  buildBusinessHours,
  toBusinessHoursRows,
  type BusinessHoursFormInput,
} from "./business-hours";

const blank = { closed: false, closes: "", opens: "" };

function form(overrides: BusinessHoursFormInput): BusinessHoursFormInput {
  return overrides;
}

describe("building the stored payload", () => {
  it("stores nothing when every day is left blank", () => {
    // An untouched form must not publish "closed all week".
    const result = buildBusinessHours(form({ monday: blank, sunday: blank }));

    expect(result).toEqual({ ok: true, value: null });
  });

  it("keeps a filled day and omits the blank ones", () => {
    const result = buildBusinessHours(
      form({
        monday: { closed: false, closes: "21:00", opens: "11:00" },
        tuesday: blank,
      }),
    );

    expect(result).toEqual({
      ok: true,
      value: { monday: { closes: "21:00", opens: "11:00" } },
    });
  });

  it("records an explicit closed day and discards any typed times", () => {
    const result = buildBusinessHours(
      form({ friday: { closed: true, closes: "21:00", opens: "11:00" } }),
    );

    expect(result).toEqual({ ok: true, value: { friday: { closed: true } } });
  });

  it("rejects a half-filled day rather than guessing the other time", () => {
    const result = buildBusinessHours(
      form({ monday: { closed: false, closes: "", opens: "11:00" } }),
    );

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.errors[0]).toMatch(
      /Monday needs both/,
    );
  });

  it("rejects times that are not 24-hour clock values", () => {
    const result = buildBusinessHours(
      form({ monday: { closed: false, closes: "9pm", opens: "11am" } }),
    );

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.errors[0]).toMatch(/24-hour/);
  });

  it("rejects a day that closes before it opens", () => {
    const result = buildBusinessHours(
      form({ monday: { closed: false, closes: "09:00", opens: "21:00" } }),
    );

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.errors[0]).toMatch(/close after/);
  });

  it("reports every bad day, not just the first", () => {
    const result = buildBusinessHours(
      form({
        monday: { closed: false, closes: "", opens: "11:00" },
        tuesday: { closed: false, closes: "bad", opens: "bad" },
      }),
    );

    expect(result.ok === false && result.errors).toHaveLength(2);
  });

  it("orders stored days Monday first regardless of input order", () => {
    const result = buildBusinessHours(
      form({
        monday: { closed: false, closes: "21:00", opens: "11:00" },
        sunday: { closed: true, closes: "", opens: "" },
      }),
    );

    expect(result.ok === true && Object.keys(result.value ?? {})).toEqual([
      "monday",
      "sunday",
    ]);
  });
});

describe("reading the stored payload back into form rows", () => {
  it("always returns seven rows", () => {
    expect(toBusinessHoursRows(null)).toHaveLength(7);
    expect(toBusinessHoursRows("nonsense")).toHaveLength(7);
    expect(toBusinessHoursRows([])).toHaveLength(7);
  });

  it("round trips a saved week", () => {
    const built = buildBusinessHours(
      form({
        monday: { closed: false, closes: "21:00", opens: "11:00" },
        sunday: { closed: true, closes: "", opens: "" },
      }),
    );

    const rows = toBusinessHoursRows(built.ok === true ? built.value : null);

    expect(rows[0]).toEqual({
      closed: false,
      closes: "21:00",
      day: "monday",
      opens: "11:00",
    });
    expect(rows[6]).toEqual({
      closed: true,
      closes: "",
      day: "sunday",
      opens: "",
    });
  });

  it("drops stored times that are not valid clock values", () => {
    // A hand-edited column must not feed invalid times back through the form.
    const rows = toBusinessHoursRows({
      monday: { closes: "25:99", opens: "x" },
    });

    expect(rows[0]).toEqual({
      closed: false,
      closes: "",
      day: "monday",
      opens: "",
    });
  });
});
