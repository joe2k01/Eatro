import { Food, FoodSchema, FoodSource } from "@db/schemas";
import { BaseRepository, type QueryResult } from "./BaseRepository";

export class FoodRepository extends BaseRepository {
  public async getFoodByIdentifier(
    identifier: { barcode: string } | { name: string },
  ): QueryResult<Food> {
    const statement = await this.prepareStatement(
      `
      SELECT * FROM foods
      WHERE
        ($barcode IS NOT NULL AND barcode = $barcode)
        OR
        ($name IS NOT NULL AND name = $name)
    `,
      "getFoodByIdentifier",
    );

    if (!statement) return null;

    const mIdentifier = identifier as { barcode?: string; name?: string };
    const result = await this.executeStatement(statement, {
      $barcode: mIdentifier.barcode ?? null,
      $name: mIdentifier.name ?? null,
    });

    if (!result) return null;

    const data = await this.getFirstRow(result);

    return data ? FoodSchema.parse(data) : null;
  }

  public async upsertFood(
    food: Omit<Food, "id" | "deleted_at">,
  ): QueryResult<number> {
    const statement = await this.prepareStatement(
      `
        INSERT INTO foods (name, brand, unit, serving_size, energy_per_serving, proteins_per_serving, carbohydrates_per_serving, fat_per_serving, barcode, source, created_at, updated_at)
        VALUES ($name, $brand, $unit, $serving_size, $energy_per_serving, $proteins_per_serving, $carbohydrates_per_serving, $fat_per_serving, $barcode, $source, $created_at, $updated_at)
        ON CONFLICT(barcode) WHERE source = ${FoodSource.Api} DO UPDATE SET
        name = $name,
        brand = $brand,
        unit = $unit,
        serving_size = $serving_size,
        energy_per_serving = $energy_per_serving,
        proteins_per_serving = $proteins_per_serving,
        carbohydrates_per_serving = $carbohydrates_per_serving,
        fat_per_serving = $fat_per_serving,
        source = $source,
        updated_at = $updated_at
        RETURNING *;
        `,
      "upsertFood",
    );

    if (!statement) return null;

    const foodUpsertFormat = {
      $name: food.name,
      $brand: food.brand,
      $unit: food.unit,
      $serving_size: food.serving_size,
      $energy_per_serving: food.energy_per_serving,
      $proteins_per_serving: food.proteins_per_serving,
      $carbohydrates_per_serving: food.carbohydrates_per_serving,
      $fat_per_serving: food.fat_per_serving,
      $barcode: food.barcode,
      $source: food.source,
      $created_at: food.created_at,
      $updated_at: food.updated_at,
    };

    const result = await this.executeStatement(statement, foodUpsertFormat);
    if (!result) return null;

    // If no changes, we need to get the food that previously existed
    if (!result.changes) {
      const identifier = food.barcode
        ? { barcode: food.barcode }
        : { name: food.name };

      const existingFood = await this.getFoodByIdentifier(identifier);
      if (!existingFood) return null;

      return existingFood.id;
    }

    return result.lastInsertRowId;
  }
}
