import { type SQLiteDatabase, SQLiteStatement } from "expo-sqlite";
import * as Sentry from "@sentry/react-native";

type QueryResult<T> = Promise<T | null>;

export class MealFoodRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  private async executeStatement<T>(
    statement: SQLiteStatement,
    handler: () => Promise<T | null>,
  ) {
    let result;

    try {
      result = await handler();
    } catch (error) {
      Sentry.captureException(error);
      console.error(error);
      return null;
    } finally {
      await statement.finalizeAsync();
    }

    return result;
  }

  public async insertMealFood(
    mealId: number,
    foodId: number,
    quantityServings: number,
    nowMs: number,
  ) {
    const statement = await this.db.prepareAsync(`
      INSERT INTO meal_foods (meal_id, food_id, quantity, created_at, updated_at, deleted_at)
      VALUES ($meal_id, $food_id, $quantity, $created_at, $updated_at, NULL);
    `);

    return await this.executeStatement(statement, async () => {
      const result = await statement.executeAsync({
        $meal_id: mealId,
        $food_id: foodId,
        $quantity: quantityServings,
        $created_at: nowMs,
        $updated_at: nowMs,
      });
      return result.changes > 0;
    });
  }
}


