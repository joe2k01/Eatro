import {
  type DayTotals,
  type Food,
  Meal,
  MealSchema,
  MealType,
  SqliteIdRowSchema,
  DayTotalsSchema,
} from "@db/schemas";
import { BaseRepository, type QueryResult } from "./BaseRepository";
import { MealFoodRepository } from "./MealFoodRepository";
import type { MealFoodWithFood } from "./MealFoodRepository";
import { CustomMealRepository } from "./CustomMealRepository";
import { CustomMealFoodRepository } from "./CustomMealFoodRepository";

export type MealMacroDelta = {
  energy: number;
  proteins: number;
  carbohydrates: number;
  fat: number;
};

type FoodMacroBasis = Pick<
  Food,
  | "serving_size"
  | "energy_per_serving"
  | "proteins_per_serving"
  | "carbohydrates_per_serving"
  | "fat_per_serving"
>;

/**
 * Macros contributed by one logged meal line: quantity × per-serving macros scaled by
 * (line serving size ÷ catalogue serving size).
 */
export function lineMacrosForLoggedLine(
  quantity: number,
  lineServingSize: number,
  food: FoodMacroBasis,
): MealMacroDelta {
  const catalogueServing = food.serving_size > 0 ? food.serving_size : 1;
  const scale = lineServingSize / catalogueServing;
  return {
    energy: quantity * food.energy_per_serving * scale,
    proteins: quantity * food.proteins_per_serving * scale,
    carbohydrates: quantity * food.carbohydrates_per_serving * scale,
    fat: quantity * food.fat_per_serving * scale,
  };
}

function lineMacrosFromMealFood(row: MealFoodWithFood): MealMacroDelta {
  return lineMacrosForLoggedLine(row.quantity, row.serving_size, row.food);
}

export class MealRepository extends BaseRepository {
  /**
   * Upsert a meal row (by day/type[/custom_type]). New rows start at zero macros;
   * on conflict only `updated_at` is touched. Call {@link rebuildMealMacros} after
   * line changes to set rolled-up totals. Must run inside a transaction.
   */
  private async upsertMealRow(args: {
    dayUtcSeconds: number;
    type: MealType;
    customType: string | null;
    nowMs: number;
  }): Promise<number> {
    const { dayUtcSeconds, type, customType, nowMs } = args;
    const effectiveCustomType = type === MealType.Custom ? customType : null;

    const upsertStatement = await this.prepareStatement(
      `
      INSERT INTO meals (day_utc, type, custom_type, energy, proteins, carbohydrates, fat, created_at, updated_at, deleted_at)
      VALUES ($day_utc, $type, $custom_type, 0, 0, 0, 0, $created_at, $updated_at, NULL)
      ON CONFLICT(day_utc, type, custom_type) WHERE custom_type IS NOT NULL DO UPDATE SET
        updated_at = $updated_at
      ON CONFLICT(day_utc, type) WHERE custom_type IS NULL DO UPDATE SET
        updated_at = $updated_at
      RETURNING id;
      `,
      "upsertMeal",
    );
    if (!upsertStatement) throw new Error("Failed to prepare meal upsert");

    const upsertResult = await this.executeStatement(upsertStatement, {
      $day_utc: dayUtcSeconds,
      $type: type,
      $custom_type: effectiveCustomType,
      $created_at: nowMs,
      $updated_at: nowMs,
    });

    if (!upsertResult) throw new Error("Meal upsert failed to execute");

    if (upsertResult.changes !== 1) {
      throw new Error(
        `Meal upsert unexpected changes: ${upsertResult.changes}`,
      );
    }

    const upsertRows = await upsertResult.getAllAsync();
    if (!upsertRows || upsertRows.length === 0) {
      throw new Error("Meal upsert returned no row");
    }

    const { id: mealId } = await SqliteIdRowSchema.parseAsync(upsertRows[0]);
    return mealId;
  }

  private async setMealMacros(
    mealId: number,
    totals: MealMacroDelta,
    nowMs: number,
  ): Promise<void> {
    const statement = await this.prepareStatement(
      `
      UPDATE meals
      SET
        energy = $energy,
        proteins = $proteins,
        carbohydrates = $carbohydrates,
        fat = $fat,
        updated_at = $updated_at
      WHERE id = $id AND deleted_at IS NULL;
      `,
      "setMealMacros",
    );

    if (!statement) throw new Error("Failed to prepare setMealMacros");

    const result = await this.executeStatement(statement, {
      $id: mealId,
      $energy: totals.energy,
      $proteins: totals.proteins,
      $carbohydrates: totals.carbohydrates,
      $fat: totals.fat,
      $updated_at: nowMs,
    });

    if (!result) throw new Error("setMealMacros failed to execute");

    if (result.changes !== 1) {
      throw new Error(`setMealMacros unexpected changes: ${result.changes}`);
    }
  }

  private async softDeleteMeal(mealId: number, nowMs: number): Promise<void> {
    const statement = await this.prepareStatement(
      `
      UPDATE meals
      SET deleted_at = $deleted_at, updated_at = $updated_at
      WHERE id = $id AND deleted_at IS NULL;
      `,
      "softDeleteMeal",
    );

    if (!statement) throw new Error("Failed to prepare softDeleteMeal");

    const result = await this.executeStatement(statement, {
      $id: mealId,
      $deleted_at: nowMs,
      $updated_at: nowMs,
    });

    if (!result) throw new Error("softDeleteMeal failed to execute");

    if (result.changes !== 1) {
      throw new Error(`softDeleteMeal unexpected changes: ${result.changes}`);
    }
  }

  /**
   * Recompute `meals.*` macros from active lines. If there are no countable lines,
   * soft-deletes the meal (empty shells are removed from the diary).
   */
  private async rebuildMealMacros(
    mealId: number,
    mealFoodRepo: MealFoodRepository,
    nowMs: number,
  ): Promise<void> {
    const lines = await mealFoodRepo.getMealFoodsByMealId(mealId);
    if (!lines || lines.length === 0) {
      await this.softDeleteMeal(mealId, nowMs);
      return;
    }

    const totals: MealMacroDelta = {
      energy: 0,
      proteins: 0,
      carbohydrates: 0,
      fat: 0,
    };

    for (const row of lines) {
      const m = lineMacrosFromMealFood(row);
      totals.energy += m.energy;
      totals.proteins += m.proteins;
      totals.carbohydrates += m.carbohydrates;
      totals.fat += m.fat;
    }

    await this.setMealMacros(mealId, totals, nowMs);
  }

  /**
   * Upsert a meal (by day/type[/custom_type]) and apply all side effects
   * (insert `meal_foods`, rebuild meal totals) inside a single SQLite transaction.
   */
  public async upsertMealAndLogFoodTx(
    args: {
      dayUtcSeconds: number;
      type: MealType;
      customType: string | null;
      foodId: number;
      quantityServings: number;
      /** Per-line serving size (g or food unit); persisted on `meal_foods`. */
      lineServingSize: number;
      nowMs: number;
    },
    mealFoodRepo: MealFoodRepository,
  ): QueryResult<number> {
    const {
      dayUtcSeconds,
      type,
      customType,
      foodId,
      quantityServings,
      lineServingSize,
      nowMs,
    } = args;

    return await this.withTransaction(async () => {
      const mealId = await this.upsertMealRow({
        dayUtcSeconds,
        type,
        customType,
        nowMs,
      });

      const mealFoodInserted = await mealFoodRepo.insertMealFood(
        mealId,
        foodId,
        quantityServings,
        lineServingSize,
        nowMs,
      );

      if (!mealFoodInserted) {
        throw new Error("meal_foods insert failed");
      }

      await this.rebuildMealMacros(mealId, mealFoodRepo, nowMs);

      return mealId;
    });
  }

  /**
   * Soft-delete a logged food line and rebuild the parent meal's macros (or remove
   * the meal when no active lines remain).
   */
  public async deleteMealFoodTx(
    args: { mealFoodId: number; nowMs: number },
    mealFoodRepo: MealFoodRepository,
  ): QueryResult<boolean> {
    const { mealFoodId, nowMs } = args;

    return await this.withTransaction(async () => {
      const row = await mealFoodRepo.getMealFoodWithFoodById(mealFoodId);
      if (!row) {
        throw new Error("Meal food not found");
      }

      const mealId = row.meal_id;

      const deleted = await mealFoodRepo.softDeleteMealFood(mealFoodId, nowMs);
      if (!deleted) {
        throw new Error("meal_foods soft delete failed");
      }

      await this.rebuildMealMacros(mealId, mealFoodRepo, nowMs);

      return true;
    });
  }

  /**
   * Update a line's quantity and per-line serving size; meal totals are rebuilt from lines.
   */
  public async updateMealFoodTx(
    args: {
      mealFoodId: number;
      newQuantityServings: number;
      newServingSize: number;
      nowMs: number;
    },
    mealFoodRepo: MealFoodRepository,
  ): QueryResult<boolean> {
    const { mealFoodId, newQuantityServings, newServingSize, nowMs } = args;

    return await this.withTransaction(async () => {
      const row = await mealFoodRepo.getMealFoodWithFoodById(mealFoodId);
      if (!row) {
        throw new Error("Meal food not found");
      }

      const updated = await mealFoodRepo.updateMealFoodLine(
        mealFoodId,
        newQuantityServings,
        newServingSize,
        nowMs,
      );
      if (!updated) {
        throw new Error("meal_foods line update failed");
      }

      await this.rebuildMealMacros(row.meal_id, mealFoodRepo, nowMs);

      return true;
    });
  }

  public async getMealByDayUtc(
    dayUtcSeconds: number,
    type: MealType,
    customType: string | null,
  ): QueryResult<Meal> {
    const statement = await this.prepareStatement(
      `
      SELECT * FROM meals
      WHERE
        day_utc = $day_utc
        AND type = $type
        AND deleted_at IS NULL
        AND (
          ($custom_type IS NULL AND custom_type IS NULL)
          OR
          (custom_type = $custom_type)
        )
      ORDER BY created_at DESC
      LIMIT 1;
      `,
      "getMealByDayUtc",
    );

    if (!statement) return null;

    const result = await this.executeStatement(statement, {
      $day_utc: dayUtcSeconds,
      $type: type,
      $custom_type: customType,
    });
    if (!result) return null;

    const row = await this.getFirstRow(result);
    return row ? MealSchema.parse(row) : null;
  }

  /**
   * Aggregate totals for all meals on a given UTC day.
   * Returns null if no meals exist for that day.
   */
  public async getDayTotals(dayUtcSeconds: number): QueryResult<DayTotals> {
    const statement = await this.prepareStatement(
      `
      SELECT
        SUM(energy) as energy,
        SUM(proteins) as proteins,
        SUM(carbohydrates) as carbohydrates,
        SUM(fat) as fat
      FROM meals
      WHERE day_utc = $day_utc AND deleted_at IS NULL;
      `,
      "getDayTotals",
    );

    if (!statement) return null;

    const result = await this.executeStatement(statement, {
      $day_utc: dayUtcSeconds,
    });
    if (!result) return null;

    const row = await this.getFirstRow(result);
    if (!row) return null;

    return DayTotalsSchema.parse(row);
  }

  /**
   * Get all meals for a given UTC day, ordered by creation time.
   */
  public async getMealsByDay(dayUtcSeconds: number): QueryResult<Meal[]> {
    const statement = await this.prepareStatement(
      `
      SELECT * FROM meals
      WHERE day_utc = $day_utc AND deleted_at IS NULL
      ORDER BY created_at ASC;
      `,
      "getMealsByDay",
    );

    if (!statement) return null;

    const result = await this.executeStatement(statement, {
      $day_utc: dayUtcSeconds,
    });
    if (!result) return null;

    const rows = await result.getAllAsync();
    return rows.map((row) => MealSchema.parse(row));
  }

  /**
   * Log an entire saved custom meal into the diary as a single transaction.
   * Upserts the meal row, inserts one meal_foods row per ingredient, then rebuilds totals.
   */
  public async logCustomMealTx(
    args: {
      dayUtcSeconds: number;
      type: MealType;
      customType: string | null;
      customMealId: number;
      nowMs: number;
    },
    customMealRepo: CustomMealRepository,
    customMealFoodRepo: CustomMealFoodRepository,
    mealFoodRepo: MealFoodRepository,
  ): QueryResult<number> {
    const { dayUtcSeconds, type, customType, customMealId, nowMs } = args;

    return await this.withTransaction(async () => {
      const customMeal = await customMealRepo.getCustomMealById(customMealId);
      if (!customMeal) throw new Error("Custom meal not found");

      const customFoods =
        await customMealFoodRepo.getFoodsByCustomMealId(customMealId);
      if (!customFoods || customFoods.length === 0) {
        throw new Error("Custom meal has no foods");
      }

      const mealId = await this.upsertMealRow({
        dayUtcSeconds,
        type,
        customType,
        nowMs,
      });

      for (const cmf of customFoods) {
        const inserted = await mealFoodRepo.insertMealFood(
          mealId,
          cmf.food_id,
          cmf.quantity,
          cmf.serving_size,
          nowMs,
        );
        if (!inserted) {
          throw new Error("meal_foods insert failed for custom meal food");
        }
      }

      await this.rebuildMealMacros(mealId, mealFoodRepo, nowMs);

      return mealId;
    });
  }
}
