const SECONDS_PER_DAY = 24 * 60 * 60;

/**
 * Current UTC timestamp as unix epoch seconds.
 */
export function utcNowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Start-of-day in UTC as unix epoch seconds.
 *
 * Example: if it's 4PM in Italy, this still returns midnight *UTC* for today's date.
 */
export function utcStartOfDaySeconds(
  epochSeconds: number = utcNowSeconds(),
): number {
  const d = new Date(epochSeconds * 1000);
  return Math.floor(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / 1000,
  );
}

/** Convenience wrapper for "start of today (UTC)". */
export function utcStartOfTodaySeconds(): number {
  return utcStartOfDaySeconds(utcNowSeconds());
}

/** Add whole days while preserving UTC midnight boundaries. */
export function addUtcDaysSeconds(dayUtcSeconds: number, days: number): number {
  return dayUtcSeconds + days * SECONDS_PER_DAY;
}
