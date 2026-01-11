import {
  type DayTotals,
  Meal,
  MealSchema,
  MealType,
  SqliteIdRowSchema,
  DayTotalsSchema,
} from "@db/schemas";
import { BaseRepository, type QueryResult } from "./BaseRepository";

export class MealRepository extends BaseRepository {
  /**
   * Upsert a meal (by day/type[/custom_type]) and apply all side effects
   * (insert `meal_foods`, increment meal totals) inside a single SQLite transaction.
   */
  public async upsertMealAndLogFoodTx(args: {
    dayUtcSeconds: number;
    type: MealType;
    customType: string | null;
    foodId: number;
    quantityServings: number;
    delta: {
      energy: number;
      proteins: number;
      carbohydrates: number;
      fat: number;
    };
    nowMs: number;
  }): QueryResult<number> {
    const {
      dayUtcSeconds,
      type,
      customType,
      foodId,
      quantityServings,
      delta,
      nowMs,
    } = args;

    return await this.withTransaction(async () => {
      const effectiveCustomType = type === MealType.Custom ? customType : null;

      // 1) Upsert the meal row and atomically increment totals.
      const upsertStatement = await this.prepareStatement(
        `
        INSERT INTO meals (day_utc, type, custom_type, energy, proteins, carbohydrates, fat, created_at, updated_at, deleted_at)
        VALUES ($day_utc, $type, $custom_type, $energy, $proteins, $carbohydrates, $fat, $created_at, $updated_at, NULL)
        ON CONFLICT(day_utc, type, custom_type) WHERE custom_type IS NOT NULL DO UPDATE SET
          energy = energy + $energy,
          proteins = proteins + $proteins,
          carbohydrates = carbohydrates + $carbohydrates,
          fat = fat + $fat,
          updated_at = $updated_at
        ON CONFLICT(day_utc, type) WHERE custom_type IS NULL DO UPDATE SET
          energy = energy + $energy,
          proteins = proteins + $proteins,
          carbohydrates = carbohydrates + $carbohydrates,
          fat = fat + $fat,
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
        $energy: delta.energy,
        $proteins: delta.proteins,
        $carbohydrates: delta.carbohydrates,
        $fat: delta.fat,
        $created_at: nowMs,
        $updated_at: nowMs,
      });

      if (!upsertResult) throw new Error("Meal upsert failed to execute");

      // `changes` should be 1 for this insert-or-update to be considered successful.
      if (upsertResult.changes !== 1) {
        throw new Error(
          `Meal upsert unexpected changes: ${upsertResult.changes}`,
        );
      }

      // We rely on `RETURNING id` here. If the driver/build ever stops returning a row,
      // we prefer to fail loudly (and rollback) rather than guessing via a follow-up SELECT.
      const upsertRow = await this.getFirstRow(upsertResult);
      if (!upsertRow) throw new Error("Meal upsert returned no row");

      const { id: mealId } = await SqliteIdRowSchema.parseAsync(upsertRow);

      // 2) Record the food entry (quantity = servings).
      const mealFoodStatement = await this.prepareStatement(
        `
          INSERT INTO meal_foods (meal_id, food_id, quantity, created_at, updated_at, deleted_at)
          VALUES ($meal_id, $food_id, $quantity, $created_at, $updated_at, NULL);
        `,
        "insertMealFood",
      );

      if (!mealFoodStatement)
        throw new Error("Failed to prepare meal_foods insert");

      const mealFoodResult = await this.executeStatement(mealFoodStatement, {
        $meal_id: mealId,
        $food_id: foodId,
        $quantity: quantityServings,
        $created_at: nowMs,
        $updated_at: nowMs,
      });
      if (!mealFoodResult)
        throw new Error("meal_foods insert failed to execute");
      if (mealFoodResult.changes !== 1) {
        throw new Error(
          `meal_foods insert unexpected changes: ${mealFoodResult.changes}`,
        );
      }

      return mealId;
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
}
