import type * as SQLite from "expo-sqlite";
import type { FoodEntryRow, FoodRow } from "../models";
import { SyncStatus } from "../enums";
import { UnixSeconds } from "../time";
import { DayRepository, type MacroTotals } from "./DayRepository";

export type InsertEntryInput = {
  food_id: number;
  quantity_grams: number;

  eaten_at: UnixSeconds;
  day_start_ts?: UnixSeconds;

  meal_type: number;
  sync_status?: SyncStatus;

  created_at?: UnixSeconds;
  updated_at?: UnixSeconds;
};

export type UpdateEntryInput = {
  id: number;
  quantity_grams: number;
  eaten_at: UnixSeconds;
  day_start_ts?: UnixSeconds;
  meal_type: number;
  updated_at?: UnixSeconds;
  // sync_status is intentionally NOT updated here (sync layer owns it).
};

export class FoodEntryRepository {
  private readonly days: DayRepository;

  constructor(private readonly db: SQLite.SQLiteDatabase) {
    this.days = new DayRepository(db);
  }

  private async getFoodForSnapshot(
    foodId: number,
  ): Promise<
    Pick<
      FoodRow,
      | "calories_per_gram"
      | "protein_per_gram"
      | "carbs_per_gram"
      | "fat_per_gram"
    >
  > {
    const food = await this.db.getFirstAsync<
      Pick<
        FoodRow,
        | "calories_per_gram"
        | "protein_per_gram"
        | "carbs_per_gram"
        | "fat_per_gram"
      >
    >(
      `
SELECT calories_per_gram, protein_per_gram, carbs_per_gram, fat_per_gram
FROM foods
WHERE id = ? AND deleted_at IS NULL
LIMIT 1;
      `.trim(),
      [foodId],
    );
    if (!food) throw new Error(`Food not found or deleted: ${foodId}`);
    return food;
  }

  private async getEntryByIdIncludingDeleted(
    id: number,
  ): Promise<FoodEntryRow | null> {
    return await this.db.getFirstAsync<FoodEntryRow>(
      `
SELECT
  id, food_id, quantity_grams,
  calories, protein, carbs, fat,
  eaten_at, day_start_ts,
  meal_type, sync_status,
  created_at, updated_at, deleted_at
FROM food_entries
WHERE id = ?
LIMIT 1;
      `.trim(),
      [id],
    );
  }

  // Transaction: insert entry + incremental update to `days`.
  async insertEntry(input: InsertEntryInput): Promise<FoodEntryRow> {
    const createdAt = input.created_at ?? UnixSeconds.now();
    const updatedAt = input.updated_at ?? createdAt;
    const dayStartTs = input.day_start_ts ?? input.eaten_at.dayStartUtc();
    const syncStatus = input.sync_status ?? SyncStatus.pending;

    let inserted: FoodEntryRow | null = null;

    await this.db.withTransactionAsync(async () => {
      const perGram = await this.getFoodForSnapshot(input.food_id);
      const calories = perGram.calories_per_gram * input.quantity_grams;
      const protein = perGram.protein_per_gram * input.quantity_grams;
      const carbs = perGram.carbs_per_gram * input.quantity_grams;
      const fat = perGram.fat_per_gram * input.quantity_grams;

      const res = await this.db.runAsync(
        `
INSERT INTO food_entries (
  food_id, quantity_grams,
  calories, protein, carbs, fat,
  eaten_at, day_start_ts,
  meal_type, sync_status,
  created_at, updated_at, deleted_at
)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL);
        `.trim(),
        [
          input.food_id,
          input.quantity_grams,
          calories,
          protein,
          carbs,
          fat,
          input.eaten_at.seconds,
          dayStartTs.seconds,
          input.meal_type,
          syncStatus,
          createdAt.seconds,
          updatedAt.seconds,
        ],
      );

      if (!res.lastInsertRowId || res.lastInsertRowId <= 0) {
        throw new Error("Insert failed: no lastInsertRowId");
      }

      await this.days.upsertDayTotals(
        dayStartTs,
        { calories, protein, carbs, fat },
        updatedAt,
      );

      inserted = await this.getEntryByIdIncludingDeleted(
        Number(res.lastInsertRowId),
      );
    });

    if (!inserted) {
      throw new Error(
        "Insert failed: transaction completed without inserted row",
      );
    }
    return inserted;
  }

  // Transaction: update entry + recompute affected day(s) (safe under edits/moves across days).
  async updateEntry(input: UpdateEntryInput): Promise<FoodEntryRow> {
    const updatedAt = input.updated_at ?? UnixSeconds.now();
    const newDayStartTs = input.day_start_ts ?? input.eaten_at.dayStartUtc();

    let updated: FoodEntryRow | null = null;

    await this.db.withTransactionAsync(async () => {
      const existing = await this.getEntryByIdIncludingDeleted(input.id);
      if (!existing || existing.deleted_at != null) {
        throw new Error(`Entry not found or deleted: ${input.id}`);
      }

      const perGram = await this.getFoodForSnapshot(existing.food_id);
      const calories = perGram.calories_per_gram * input.quantity_grams;
      const protein = perGram.protein_per_gram * input.quantity_grams;
      const carbs = perGram.carbs_per_gram * input.quantity_grams;
      const fat = perGram.fat_per_gram * input.quantity_grams;

      const res = await this.db.runAsync(
        `
UPDATE food_entries
SET
  quantity_grams = ?,
  calories = ?,
  protein = ?,
  carbs = ?,
  fat = ?,
  eaten_at = ?,
  day_start_ts = ?,
  meal_type = ?,
  updated_at = ?
WHERE id = ? AND deleted_at IS NULL;
        `.trim(),
        [
          input.quantity_grams,
          calories,
          protein,
          carbs,
          fat,
          input.eaten_at.seconds,
          newDayStartTs.seconds,
          input.meal_type,
          updatedAt.seconds,
          input.id,
        ],
      );

      if (res.changes !== 1) {
        throw new Error(
          `Update failed: expected 1 row changed, got ${res.changes}`,
        );
      }

      await this.days.recomputeDay(
        UnixSeconds.fromSeconds(existing.day_start_ts),
        updatedAt,
      );
      if (newDayStartTs.seconds !== existing.day_start_ts) {
        await this.days.recomputeDay(newDayStartTs, updatedAt);
      }

      updated = await this.getEntryByIdIncludingDeleted(input.id);
    });

    if (!updated) {
      throw new Error("Update failed: entry not found after update");
    }
    return updated;
  }

  // Transaction: soft-delete entry + recompute day totals.
  async softDeleteEntry(
    id: number,
    deletedAt: UnixSeconds = UnixSeconds.now(),
  ): Promise<void> {
    await this.db.withTransactionAsync(async () => {
      const existing = await this.getEntryByIdIncludingDeleted(id);
      if (!existing || existing.deleted_at != null) return;

      await this.db.runAsync(
        `
UPDATE food_entries
SET deleted_at = ?, updated_at = ?
WHERE id = ? AND deleted_at IS NULL;
        `.trim(),
        [deletedAt.seconds, deletedAt.seconds, id],
      );

      await this.days.recomputeDay(
        UnixSeconds.fromSeconds(existing.day_start_ts),
        deletedAt,
      );
    });
  }

  async getEntriesByDay(dayStartTs: UnixSeconds): Promise<FoodEntryRow[]> {
    return await this.db.getAllAsync<FoodEntryRow>(
      `
SELECT
  id, food_id, quantity_grams,
  calories, protein, carbs, fat,
  eaten_at, day_start_ts,
  meal_type, sync_status,
  created_at, updated_at, deleted_at
FROM food_entries
WHERE day_start_ts = ? AND deleted_at IS NULL
ORDER BY eaten_at ASC;
      `.trim(),
      [dayStartTs.seconds],
    );
  }

  async getEntriesByRange(
    startTs: UnixSeconds,
    endTs: UnixSeconds,
  ): Promise<FoodEntryRow[]> {
    return await this.db.getAllAsync<FoodEntryRow>(
      `
SELECT
  id, food_id, quantity_grams,
  calories, protein, carbs, fat,
  eaten_at, day_start_ts,
  meal_type, sync_status,
  created_at, updated_at, deleted_at
FROM food_entries
WHERE eaten_at >= ? AND eaten_at < ? AND deleted_at IS NULL
ORDER BY eaten_at ASC;
      `.trim(),
      [startTs.seconds, endTs.seconds],
    );
  }

  // Transaction: expand meal_items into food_entries atomically (logging a meal).
  async logMealAsEntries(args: {
    mealId: number;
    eaten_at: UnixSeconds;
    day_start_ts?: UnixSeconds;
    meal_type: number;
  }): Promise<FoodEntryRow[]> {
    const dayStartTs = args.day_start_ts ?? args.eaten_at.dayStartUtc();
    const createdAt = UnixSeconds.now();

    let created: FoodEntryRow[] = [];

    await this.db.withTransactionAsync(async () => {
      const items = await this.db.getAllAsync<{
        food_id: number;
        quantity_grams: number;
      }>(
        `
SELECT food_id, quantity_grams
FROM meal_items
WHERE meal_id = ?;
        `.trim(),
        [args.mealId],
      );

      created = [];

      for (const item of items) {
        const perGram = await this.getFoodForSnapshot(item.food_id);
        const calories = perGram.calories_per_gram * item.quantity_grams;
        const protein = perGram.protein_per_gram * item.quantity_grams;
        const carbs = perGram.carbs_per_gram * item.quantity_grams;
        const fat = perGram.fat_per_gram * item.quantity_grams;

        const res = await this.db.runAsync(
          `
INSERT INTO food_entries (
  food_id, quantity_grams,
  calories, protein, carbs, fat,
  eaten_at, day_start_ts,
  meal_type, sync_status,
  created_at, updated_at, deleted_at
)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL);
          `.trim(),
          [
            item.food_id,
            item.quantity_grams,
            calories,
            protein,
            carbs,
            fat,
            args.eaten_at.seconds,
            dayStartTs.seconds,
            args.meal_type,
            SyncStatus.pending,
            createdAt.seconds,
            createdAt.seconds,
          ],
        );

        created.push({
          id: Number(res.lastInsertRowId),
          food_id: item.food_id,
          quantity_grams: item.quantity_grams,
          calories,
          protein,
          carbs,
          fat,
          eaten_at: args.eaten_at.seconds,
          day_start_ts: dayStartTs.seconds,
          meal_type: args.meal_type as any,
          sync_status: SyncStatus.pending,
          created_at: createdAt.seconds,
          updated_at: createdAt.seconds,
          deleted_at: null,
        });
      }

      const delta = created.reduce<MacroTotals>(
        (acc, e) => {
          acc.calories += e.calories;
          acc.protein += e.protein;
          acc.carbs += e.carbs;
          acc.fat += e.fat;
          return acc;
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0 },
      );
      await this.days.upsertDayTotals(dayStartTs, delta, createdAt);
    });

    return created;
  }
}
