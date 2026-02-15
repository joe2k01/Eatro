import { BaseRepository, type QueryResult } from "./BaseRepository";
import { MealFoodSchema, type MealFood } from "@db/schemas/MealFood";
import { FoodSchema, type Food } from "@db/schemas/Food";

export type MealFoodWithFood = MealFood & {
  food: Food;
};

const MealFoodWithFoodSchema = MealFoodSchema.extend({
  food: FoodSchema,
});

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

  /**
   * Get all meal foods for a meal with food details joined.
   */
  public async getMealFoodsByMealId(
    mealId: number,
  ): QueryResult<MealFoodWithFood[]> {
    const statement = await this.prepareStatement(
      `
      SELECT
        mf.id,
        mf.meal_id,
        mf.food_id,
        mf.quantity,
        mf.created_at,
        mf.updated_at,
        mf.deleted_at,
        f.id as f_id,
        f.name as f_name,
        f.brand as f_brand,
        f.unit as f_unit,
        f.serving_size as f_serving_size,
        f.energy_per_serving as f_energy_per_serving,
        f.proteins_per_serving as f_proteins_per_serving,
        f.carbohydrates_per_serving as f_carbohydrates_per_serving,
        f.fat_per_serving as f_fat_per_serving,
        f.barcode as f_barcode,
        f.source as f_source,
        f.created_at as f_created_at,
        f.updated_at as f_updated_at,
        f.deleted_at as f_deleted_at
      FROM meal_foods mf
      INNER JOIN foods f ON mf.food_id = f.id
      WHERE mf.meal_id = $meal_id AND mf.deleted_at IS NULL AND f.deleted_at IS NULL
      ORDER BY mf.created_at ASC;
      `,
      "getMealFoodsByMealId",
    );

    if (!statement) return null;

    const result = await this.executeStatement(statement, {
      $meal_id: mealId,
    });
    if (!result) return null;

    const rows = await result.getAllAsync();
    return rows.map((row) => {
      // Type assert row as Record to access properties
      const rowData = row as Record<string, unknown>;

      // Transform the flat row into nested structure
      const mealFood = MealFoodSchema.parse({
        id: rowData.id,
        meal_id: rowData.meal_id,
        food_id: rowData.food_id,
        quantity: rowData.quantity,
        created_at: rowData.created_at,
        updated_at: rowData.updated_at,
        deleted_at: rowData.deleted_at,
      });

      const food = FoodSchema.parse({
        id: rowData.f_id,
        name: rowData.f_name,
        brand: rowData.f_brand,
        unit: rowData.f_unit,
        serving_size: rowData.f_serving_size,
        energy_per_serving: rowData.f_energy_per_serving,
        proteins_per_serving: rowData.f_proteins_per_serving,
        carbohydrates_per_serving: rowData.f_carbohydrates_per_serving,
        fat_per_serving: rowData.f_fat_per_serving,
        barcode: rowData.f_barcode,
        source: rowData.f_source,
        created_at: rowData.f_created_at,
        updated_at: rowData.f_updated_at,
        deleted_at: rowData.f_deleted_at,
      });

      return MealFoodWithFoodSchema.parse({
        ...mealFood,
        food,
      });
    });
  }
}
