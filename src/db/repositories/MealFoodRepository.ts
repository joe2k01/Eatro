import { BaseRepository, type QueryResult } from "./BaseRepository";

export class MealFoodRepository extends BaseRepository {
  /**
   * Insert a meal_foods entry.
   * This should typically be called within a transaction.
   */
  public async insertMealFood(
    mealId: number,
    foodId: number,
    quantityServings: number,
    nowMs: number,
  ): QueryResult<boolean> {
    const statement = await this.prepareStatement(
      `
      INSERT INTO meal_foods (meal_id, food_id, quantity, created_at, updated_at, deleted_at)
      VALUES ($meal_id, $food_id, $quantity, $created_at, $updated_at, NULL);
    `,
      "insertMealFood",
    );

    if (!statement) return null;

    const result = await this.executeStatement(statement, {
      $meal_id: mealId,
      $food_id: foodId,
      $quantity: quantityServings,
      $created_at: nowMs,
      $updated_at: nowMs,
    });

    if (!result) return null;

    if (result.changes !== 1) {
      throw new Error(
        `meal_foods insert unexpected changes: ${result.changes}`,
      );
    }

    return true;
  }
}
