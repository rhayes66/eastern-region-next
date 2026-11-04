import { MONTHS } from "@/lib/constants";

export type GridCell = { amount: number; paid: boolean } | null;

export type GridRow = {
  year: string;
  /** One entry per month, January to December. null = no record. */
  cells: GridCell[];
  /** Sum of PAID amounts for the year. */
  total: number;
};

type DuesLike = { year: string; month: string; amount: number; paid: boolean };

/**
 * Pivot flat dues records into a year x month grid (newest year first),
 * like the legacy "Dues Details" table. Totals count paid amounts only.
 */
export function buildDuesGrid(rows: DuesLike[]): {
  grid: GridRow[];
  grandTotal: number;
} {
  const byYear = new Map<string, GridCell[]>();
  for (const r of rows) {
    const idx = MONTHS.indexOf(r.month as (typeof MONTHS)[number]);
    if (idx < 0) continue;
    const cells = byYear.get(r.year) ?? MONTHS.map(() => null as GridCell);
    cells[idx] = { amount: r.amount, paid: r.paid };
    byYear.set(r.year, cells);
  }
  const grid = [...byYear.entries()]
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .map(([year, cells]) => ({
      year,
      cells,
      total: cells.reduce((s, c) => s + (c?.paid ? c.amount : 0), 0),
    }));
  return { grid, grandTotal: grid.reduce((s, r) => s + r.total, 0) };
}
