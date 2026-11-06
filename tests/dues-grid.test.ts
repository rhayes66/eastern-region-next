import { describe, it, expect } from "vitest";
import { buildDuesGrid } from "@/lib/dues-grid";

describe("buildDuesGrid", () => {
  const rows = [
    { year: "2025", month: "march", amount: 10, paid: true },
    { year: "2026", month: "january", amount: 10, paid: true },
    { year: "2026", month: "december", amount: 10, paid: false },
    { year: "2026", month: "february", amount: 10, paid: true },
  ];

  it("groups by year, newest first, with 12 month slots", () => {
    const { grid } = buildDuesGrid(rows);
    expect(grid.map((r) => r.year)).toEqual(["2026", "2025"]);
    expect(grid[0].cells).toHaveLength(12);
    expect(grid[0].cells[0]).toEqual({ amount: 10, paid: true });
    expect(grid[0].cells[2]).toBeNull();
    expect(grid[0].cells[11]).toEqual({ amount: 10, paid: false });
  });

  it("totals count paid amounts only", () => {
    const { grid, grandTotal } = buildDuesGrid(rows);
    expect(grid[0].total).toBe(20);
    expect(grid[1].total).toBe(10);
    expect(grandTotal).toBe(30);
  });

  it("handles no records", () => {
    expect(buildDuesGrid([])).toEqual({ grid: [], grandTotal: 0 });
  });
});
