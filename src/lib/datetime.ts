/**
 * Convert a timezone-naive `datetime-local` value (e.g. "2026-12-05T18:00"),
 * entered as FINLAND wall-clock time, into a UTC ISO timestamp — correct across
 * DST. Returns "" for empty input.
 *
 * Technique: compute the offset the target timezone had at that instant by
 * formatting a provisional UTC date back into the zone and measuring the delta,
 * with a second pass to settle values near a DST boundary. No date library.
 */
const TZ = "Europe/Helsinki";

function offsetMs(instant: Date): number {
  // What wall-clock does TZ show for this UTC instant?
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(instant);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUTC = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour") === 24 ? 0 : get("hour"),
    get("minute"),
    get("second")
  );
  return asUTC - instant.getTime();
}

export function finlandLocalToUTCISO(local: string): string {
  if (!local) return "";
  // Parse the naive value as if it were UTC, then subtract the TZ offset so the
  // wall-clock reads as Finland time.
  const naiveUTC = new Date(`${local}:00Z`);
  if (Number.isNaN(naiveUTC.getTime())) return "";
  let guess = new Date(naiveUTC.getTime() - offsetMs(naiveUTC));
  // Re-measure at the guessed instant to settle DST-boundary cases.
  guess = new Date(naiveUTC.getTime() - offsetMs(guess));
  return guess.toISOString();
}
