import type * as SQLite from "expo-sqlite";
import type { MealItemRow, MealRow } from "../models";
import { UnixSeconds } from "../time";

export type CreateMealInput = {
  name: string;
  created_at?: UnixSeconds;
};

export type AddMealItemInput = {
  meal_id: number;
  food_id: number;
  quantity_grams: number;
};

export type MealWithItems = {
  meal: MealRow;
  items: MealItemRow[];
};

export class MealRepository {
  constructor(private readonly db: SQLite.SQLiteDatabase) {}

  async createMeal(input: CreateMealInput): Promise<MealRow> {
    const createdAt = input.created_at ?? UnixSeconds.now();

    const res = await this.db.runAsync(
      `
INSERT INTO meals (name, created_at, updated_at, deleted_at)
VALUES (?, ?, ?, NULL);
      `.trim(),
      [input.name, createdAt.seconds, createdAt.seconds],
    );

    if (!res.lastInsertRowId || res.lastInsertRowId <= 0) {
      throw new Error("createMeal failed: no lastInsertRowId");
    }

    const meal = await this.db.getFirstAsync<MealRow>(
      `
SELECT id, name, created_at, updated_at, deleted_at
FROM meals
WHERE id = ? AND deleted_at IS NULL
LIMIT 1;
      `.trim(),
      [Number(res.lastInsertRowId)],
    );
    if (!meal)
      throw new Error("createMeal failed: meal not found after insert");
    return meal;
  }

  async addMealItem(input: AddMealItemInput): Promise<MealItemRow> {
    const res = await this.db.runAsync(
      `
INSERT INTO meal_items (meal_id, food_id, quantity_grams)
VALUES (?, ?, ?);
      `.trim(),
      [input.meal_id, input.food_id, input.quantity_grams],
    );

    if (!res.lastInsertRowId || res.lastInsertRowId <= 0) {
      throw new Error("addMealItem failed: no lastInsertRowId");
    }

    const row = await this.db.getFirstAsync<MealItemRow>(
      `
SELECT id, meal_id, food_id, quantity_grams
FROM meal_items
WHERE id = ?
LIMIT 1;
      `.trim(),
      [Number(res.lastInsertRowId)],
    );
    if (!row)
      throw new Error("addMealItem failed: item not found after insert");
    return row;
  }

  async getMealWithItems(mealId: number): Promise<MealWithItems | null> {
    const meal = await this.db.getFirstAsync<MealRow>(
      `
SELECT id, name, created_at, updated_at, deleted_at
FROM meals
WHERE id = ? AND deleted_at IS NULL
LIMIT 1;
      `.trim(),
      [mealId],
    );
    if (!meal) return null;

    const items = await this.db.getAllAsync<MealItemRow>(
      `
SELECT id, meal_id, food_id, quantity_grams
FROM meal_items
WHERE meal_id = ?
ORDER BY id ASC;
      `.trim(),
      [mealId],
    );

    return { meal, items };
  }

  async deleteMeal(
    mealId: number,
    deletedAt: UnixSeconds = UnixSeconds.now(),
  ): Promise<void> {
    await this.db.withTransactionAsync(async () => {
      await this.db.runAsync(
        `
UPDATE meals
SET deleted_at = ?, updated_at = ?
WHERE id = ? AND deleted_at IS NULL;
        `.trim(),
        [deletedAt.seconds, deletedAt.seconds, mealId],
      );

      // meal_items has no deleted_at; hard-delete for consistency.
      await this.db.runAsync(`DELETE FROM meal_items WHERE meal_id = ?;`, [
        mealId,
      ]);
    });
  }
}
