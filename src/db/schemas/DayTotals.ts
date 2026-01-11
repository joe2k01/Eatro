import { z } from "zod";

const coerceNumber = z
  .number()
  .nonnegative()
  .transform((val) => val ?? 0);

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
