import { describe, expect, it } from "vitest";

import { csvRowsToRecords, parseCsv } from "@/features/cms/domain/csv";

describe("catalog CSV parser", () => {
  it("handles quoted commas, escaped quotes, and CRLF", () => {
    expect(
      parseCsv('name,description\r\n"Orbit, Gold","A ""real"" frame"'),
    ).toEqual([
      ["name", "description"],
      ["Orbit, Gold", 'A "real" frame'],
    ]);
  });

  it("maps rows without treating formulas as executable content", () => {
    expect(
      csvRowsToRecords(parseCsv('name,sku\n"=SUM(1,2)",SAFE-1'))[0],
    ).toEqual({
      rowNumber: 2,
      values: { name: "=SUM(1,2)", sku: "SAFE-1" },
    });
  });

  it("rejects duplicate headers", () => {
    expect(() => csvRowsToRecords(parseCsv("sku,sku\nA,B"))).toThrow(
      "Duplicate CSV header",
    );
  });
});
