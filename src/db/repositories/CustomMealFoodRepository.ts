import { BaseRepository, type QueryResult } from "./BaseRepository";
import {
  CustomMealFoodSchema,
  type CustomMealFood,
} from "@db/schemas/CustomMealFood";
import { FoodSchema, type Food } from "@db/schemas/Food";

export type CustomMealFoodWithFood = CustomMealFood & {
  food: Food;
};

const CustomMealFoodWithFoodSchema = CustomMealFoodSchema.extend({
  food: FoodSchema,
});

export class CustomMealFoodRepository extends BaseRepository {
  public async insertCustomMealFood(
    customMealId: number,
    foodId: number,
    quantity: number,
    servingSize: number,
    energy: number,
    proteins: number,
    carbohydrates: number,
    fat: number,
    nowMs: number,
  ): QueryResult<boolean> {
    const statement = await this.prepareStatement(
      `
      INSERT INTO custom_meal_foods (custom_meal_id, food_id, quantity, serving_size, energy, proteins, carbohydrates, fat, created_at, updated_at, deleted_at)
      VALUES ($custom_meal_id, $food_id, $quantity, $serving_size, $energy, $proteins, $carbohydrates, $fat, $created_at, $updated_at, NULL);
      `,
      "insertCustomMealFood",
    );

    if (!statement) return null;

    const result = await this.executeStatement(statement, {
      $custom_meal_id: customMealId,
      $food_id: foodId,
      $quantity: quantity,
      $serving_size: servingSize,
      $energy: energy,
      $proteins: proteins,
      $carbohydrates: carbohydrates,
      $fat: fat,
      $created_at: nowMs,
      $updated_at: nowMs,
    });

    if (!result) return null;

    if (result.changes !== 1) {
      throw new Error(
        `custom_meal_foods insert unexpected changes: ${result.changes}`,
      );
    }

    return true;
  }

  public async getFoodsByCustomMealId(
    customMealId: number,
  ): QueryResult<CustomMealFoodWithFood[]> {
    const statement = await this.prepareStatement(
      `
      SELECT
        cmf.id,
        cmf.custom_meal_id,
        cmf.food_id,
        cmf.quantity,
        cmf.serving_size,
        cmf.energy,
        cmf.proteins,
        cmf.carbohydrates,
        cmf.fat,
        cmf.created_at,
        cmf.updated_at,
        cmf.deleted_at,
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
      FROM custom_meal_foods cmf
      INNER JOIN foods f ON cmf.food_id = f.id
      WHERE cmf.custom_meal_id = $custom_meal_id
        AND cmf.deleted_at IS NULL
        AND f.deleted_at IS NULL
      ORDER BY cmf.created_at ASC;
      `,
      "getFoodsByCustomMealId",
    );

    if (!statement) return null;

    const result = await this.executeStatement(statement, {
      $custom_meal_id: customMealId,
    });
    if (!result) return null;

    const rows = await result.getAllAsync();
    return rows.map((row) => {
      const rowData = row as Record<string, unknown>;

      const customMealFood = CustomMealFoodSchema.parse({
        id: rowData.id,
        custom_meal_id: rowData.custom_meal_id,
        food_id: rowData.food_id,
        quantity: rowData.quantity,
        serving_size: rowData.serving_size,
        energy: rowData.energy,
        proteins: rowData.proteins,
        carbohydrates: rowData.carbohydrates,
        fat: rowData.fat,
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

      return CustomMealFoodWithFoodSchema.parse({
        ...customMealFood,
        food,
      });
    });
  }
}
