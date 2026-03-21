import { BaseRepository, type QueryResult } from "./BaseRepository";
import {
  CustomMealFoodSchema,
  type CustomMealFood,
} from "@db/schemas/CustomMealFood";
import { SqliteIdRowSchema } from "@db/schemas";

export type InsertCustomMealFoodArgs = {
  customMealId: number;
  foodId: number;
  name: string;
  brand: string | null;
  quantity: number;
  servingSize: number;
  energy: number;
  proteins: number;
  carbohydrates: number;
  fat: number;
  nowMs: number;
};

export class CustomMealFoodRepository extends BaseRepository {
  public async insertCustomMealFood(
    args: InsertCustomMealFoodArgs,
  ): QueryResult<number> {
    const statement = await this.prepareStatement(
      `
      INSERT INTO custom_meal_foods (custom_meal_id, food_id, name, brand, quantity, serving_size, energy, proteins, carbohydrates, fat, created_at, updated_at, deleted_at)
      VALUES ($custom_meal_id, $food_id, $name, $brand, $quantity, $serving_size, $energy, $proteins, $carbohydrates, $fat, $created_at, $updated_at, NULL)
      RETURNING id;
      `,
      "insertCustomMealFood",
    );

    if (!statement) return null;

    const result = await this.executeStatement(statement, {
      $custom_meal_id: args.customMealId,
      $food_id: args.foodId,
      $name: args.name,
      $brand: args.brand,
      $quantity: args.quantity,
      $serving_size: args.servingSize,
      $energy: args.energy,
      $proteins: args.proteins,
      $carbohydrates: args.carbohydrates,
      $fat: args.fat,
      $created_at: args.nowMs,
      $updated_at: args.nowMs,
    });

    if (!result) return null;

    const rows = await result.getAllAsync();
    if (!rows || rows.length === 0) return null;

    const { id } = SqliteIdRowSchema.parse(rows[0]);
    return id;
  }

  public async getFoodsByCustomMealId(
    customMealId: number,
  ): QueryResult<CustomMealFood[]> {
    const statement = await this.prepareStatement(
      `
      SELECT * FROM custom_meal_foods
      WHERE custom_meal_id = $custom_meal_id
        AND deleted_at IS NULL
      ORDER BY created_at ASC;
      `,
      "getFoodsByCustomMealId",
    );

    if (!statement) return null;

    const result = await this.executeStatement(statement, {
      $custom_meal_id: customMealId,
    });
    if (!result) return null;

    const rows = await result.getAllAsync();
    return rows.map((row) => CustomMealFoodSchema.parse(row));
  }
}
