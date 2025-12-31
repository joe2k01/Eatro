import type * as SQLite from "expo-sqlite";
import type { DayRow } from "../models";
import { UnixSeconds } from "../time";

export type MacroTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export class DayRepository {
  constructor(private readonly db: SQLite.SQLiteDatabase) {}

  async upsertDayTotals(
    dayStartTs: UnixSeconds,
    delta: MacroTotals,
    updatedAt: UnixSeconds = UnixSeconds.now(),
  ): Promise<void> {
    await this.db.runAsync(
      `
INSERT INTO days (day_start_ts, total_calories, total_protein, total_carbs, total_fat, updated_at)
VALUES (?, ?, ?, ?, ?, ?)
ON CONFLICT(day_start_ts) DO UPDATE SET
  total_calories = total_calories + excluded.total_calories,
  total_protein  = total_protein  + excluded.total_protein,
  total_carbs    = total_carbs    + excluded.total_carbs,
  total_fat      = total_fat      + excluded.total_fat,
  updated_at     = excluded.updated_at;
      `.trim(),
      [
        dayStartTs.seconds,
        delta.calories,
        delta.protein,
        delta.carbs,
        delta.fat,
        updatedAt.seconds,
      ],
    );
  }

  async recomputeDay(
    dayStartTs: UnixSeconds,
    updatedAt: UnixSeconds = UnixSeconds.now(),
  ): Promise<DayRow> {
    const sums = await this.db.getFirstAsync<{
      total_calories: number | null;
      total_protein: number | null;
      total_carbs: number | null;
      total_fat: number | null;
    }>(
      `
SELECT
  SUM(calories) AS total_calories,
  SUM(protein)  AS total_protein,
  SUM(carbs)    AS total_carbs,
  SUM(fat)      AS total_fat
FROM food_entries
WHERE day_start_ts = ? AND deleted_at IS NULL;
      `.trim(),
      [dayStartTs.seconds],
    );

    const row: DayRow = {
      day_start_ts: dayStartTs.seconds,
      total_calories: sums?.total_calories ?? 0,
      total_protein: sums?.total_protein ?? 0,
      total_carbs: sums?.total_carbs ?? 0,
      total_fat: sums?.total_fat ?? 0,
      updated_at: updatedAt.seconds,
    };

    await this.db.runAsync(
      `
INSERT INTO days (day_start_ts, total_calories, total_protein, total_carbs, total_fat, updated_at)
VALUES (?, ?, ?, ?, ?, ?)
ON CONFLICT(day_start_ts) DO UPDATE SET
  total_calories = excluded.total_calories,
  total_protein  = excluded.total_protein,
  total_carbs    = excluded.total_carbs,
  total_fat      = excluded.total_fat,
  updated_at     = excluded.updated_at;
      `.trim(),
      [
        row.day_start_ts,
        row.total_calories,
        row.total_protein,
        row.total_carbs,
        row.total_fat,
        row.updated_at,
      ],
    );

    return row;
  }

  async getDaySummary(dayStartTs: number): Promise<DayRow | null> {
    return await this.db.getFirstAsync<DayRow>(
      `
SELECT
  day_start_ts,
  total_calories,
  total_protein,
  total_carbs,
  total_fat,
  updated_at
FROM days
WHERE day_start_ts = ?;
      `.trim(),
      [dayStartTs],
    );
  }
}
