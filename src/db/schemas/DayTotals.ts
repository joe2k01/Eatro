import { z } from "zod";

/** Accepts number, null, or undefined (e.g. SQLite SUM() with no rows) and coerces to a non‑negative number. */
const coerceNumber = z
  .union([z.number(), z.null(), z.undefined()])
  .transform((val) => Math.max(0, val ?? 0));

/**
 * Schema for aggregated day totals from meals.
 * SQLite SUM() returns NULL if no rows match, so we transform null to 0.
 */
export const DayTotalsSchema = z.object({
  energy: coerceNumber,
  proteins: coerceNumber,
  carbohydrates: coerceNumber,
  fat: coerceNumber,
});

export type DayTotals = z.infer<typeof DayTotalsSchema>;
