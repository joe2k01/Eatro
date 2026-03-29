import {
  CustomMealSchema,
  type CustomMeal,
  SqliteIdRowSchema,
} from "@db/schemas";
import { BaseRepository, type QueryResult } from "./BaseRepository";
import { CustomMealFoodRepository } from "./CustomMealFoodRepository";

type CreateCustomMealArgs = {
  name: string;
  energy: number;
  proteins: number;
  carbohydrates: number;
  fat: number;
  nowMs: number;
};

type CustomMealFoodInput = {
  foodId: number;
  name: string;
  brand: string | null;
  quantity: number;
  servingSize: number;
  energy: number;
  proteins: number;
  carbohydrates: number;
  fat: number;
};

export class CustomMealRepository extends BaseRepository {
  public async createCustomMeal(
    args: CreateCustomMealArgs,
  ): QueryResult<number> {
    const { name, energy, proteins, carbohydrates, fat, nowMs } = args;

    const statement = await this.prepareStatement(
      `
      INSERT INTO custom_meals (name, energy, proteins, carbohydrates, fat, created_at, updated_at, deleted_at)
      VALUES ($name, $energy, $proteins, $carbohydrates, $fat, $created_at, $updated_at, NULL)
      RETURNING id;
      `,
      "createCustomMeal",
    );

    if (!statement) return null;

    const result = await this.executeStatement(statement, {
      $name: name,
      $energy: energy,
      $proteins: proteins,
      $carbohydrates: carbohydrates,
      $fat: fat,
      $created_at: nowMs,
      $updated_at: nowMs,
    });

    if (!result) return null;

    const rows = await result.getAllAsync();
    if (!rows || rows.length === 0) return null;

    const { id } = SqliteIdRowSchema.parse(rows[0]);
    return id;
  }

  public async getCustomMealById(id: number): QueryResult<CustomMeal> {
    const statement = await this.prepareStatement(
      `
      SELECT * FROM custom_meals
      WHERE id = $id AND deleted_at IS NULL;
      `,
      "getCustomMealById",
    );

    if (!statement) return null;

    const result = await this.executeStatement(statement, { $id: id });
    if (!result) return null;

    const row = await this.getFirstRow(result);
    return row ? CustomMealSchema.parse(row) : null;
  }

  public async getAllCustomMeals(): QueryResult<CustomMeal[]> {
    const statement = await this.prepareStatement(
      `
      SELECT * FROM custom_meals
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC;
      `,
      "getAllCustomMeals",
    );

    if (!statement) return null;

    const result = await this.executeStatement(statement, {});
    if (!result) return null;

    const rows = await result.getAllAsync();
    return rows.map((row) => CustomMealSchema.parse(row));
  }

  public async searchCustomMeals(query: string): QueryResult<CustomMeal[]> {
    const trimmed = query.trim();

    const statement = await this.prepareStatement(
      `
      SELECT * FROM custom_meals
      WHERE deleted_at IS NULL
        AND ($query = '' OR name LIKE '%' || $query || '%')
      ORDER BY created_at DESC;
      `,
      "searchCustomMeals",
    );

    if (!statement) return null;

    const result = await this.executeStatement(statement, {
      $query: trimmed,
    });
    if (!result) return null;

    const rows = await result.getAllAsync();
    return rows.map((row) => CustomMealSchema.parse(row));
  }

  public async createCustomMealWithFoodsTx(
    meal: CreateCustomMealArgs,
    foods: CustomMealFoodInput[],
    customMealFoodRepo: CustomMealFoodRepository,
  ): QueryResult<number> {
    return await this.withTransaction(async () => {
      const mealId = await this.createCustomMeal(meal);
      if (mealId === null) {
        throw new Error("Failed to create custom meal");
      }

      // Serialize inserts: `insertCustomMealFood` reuses one prepared statement per
      // repo; overlapping executeAsync on that statement is unsafe (see useGetDay).
      for (const food of foods) {
        const insertedId = await customMealFoodRepo.insertCustomMealFood({
          customMealId: mealId,
          foodId: food.foodId,
          name: food.name,
          brand: food.brand,
          quantity: food.quantity,
          servingSize: food.servingSize,
          energy: food.energy,
          proteins: food.proteins,
          carbohydrates: food.carbohydrates,
          fat: food.fat,
          nowMs: meal.nowMs,
        });

        if (insertedId === null) {
          throw new Error("Failed to insert custom meal food");
        }
      }

      return mealId;
    });
  }
}
