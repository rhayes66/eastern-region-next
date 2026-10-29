import { describe, it, expect } from "vitest";
import { sortDues } from "@/lib/dues-sort";

describe("sortDues", () => {
  it("orders months Jan → Dec within a year (not alphabetically)", () => {
    const rows = [
      { year: "2026", month: "august" },
      { year: "2026", month: "january" },
      { year: "2026", month: "december" },
      { year: "2026", month: "april" },
    ];
    expect(sortDues(rows).map((r) => r.month)).toEqual([
      "january",
      "april",
      "august",
      "december",
    ]);
  });

  it("orders years descending, then calendar order within each year", () => {
    const rows = [
      { year: "2025", month: "march" },
      { year: "2026", month: "february" },
      { year: "2026", month: "january" },
      { year: "2025", month: "january" },
    ];
    expect(sortDues(rows).map((r) => `${r.year}-${r.month}`)).toEqual([
      "2026-january",
      "2026-february",
      "2025-january",
      "2025-march",
    ]);
  });

  it("does not mutate the input array", () => {
    const rows = [
      { year: "2026", month: "december" },
      { year: "2026", month: "january" },
    ];
    const copy = [...rows];
    sortDues(rows);
    expect(rows).toEqual(copy);
  });
});
