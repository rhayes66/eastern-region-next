import { MONTHS } from "@/lib/constants";

/**
 * Sort dues records: newest YEAR first (descending), and within each year in
 * calendar order January → December. Month is stored as a lowercase name, so a
 * plain string sort would order them alphabetically (April, August, …) — we use
 * the position in MONTHS instead.
 */
export function sortDues<T extends { year: string; month: string }>(
  rows: T[]
): T[] {
  return [...rows].sort((a, b) => {
    if (a.year !== b.year) return Number(b.year) - Number(a.year);
    return (
      MONTHS.indexOf(a.month as (typeof MONTHS)[number]) -
      MONTHS.indexOf(b.month as (typeof MONTHS)[number])
    );
  });
}
