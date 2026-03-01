import { Food, FoodSchema, FoodSource } from "@db/schemas";
import { BaseRepository, type QueryResult } from "./BaseRepository";

export class FoodRepository extends BaseRepository {
  public async getFoodByIdentifier(
    identifier: { barcode: string } | { name: string } | { id: number },
  ): QueryResult<Food> {
    const statement = await this.prepareStatement(
      `
      SELECT * FROM foods
      WHERE deleted_at IS NULL
        AND (
          ($id IS NOT NULL AND id = $id)
          OR ($barcode IS NOT NULL AND barcode = $barcode)
          OR ($name IS NOT NULL AND name = $name)
        )
    `,
      "getFoodByIdentifier",
    );

    if (!statement) return null;

    const mIdentifier = identifier as {
      id?: number;
      barcode?: string;
      name?: string;
    };
    const result = await this.executeStatement(statement, {
      $id: mIdentifier.id ?? null,
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

    const params = {
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

    const result = await this.executeStatement(statement, params);
    if (!result) return null;

    const rows = await result.getAllAsync();
    if (!rows || rows.length < 1) {
      return null;
    }

    const [row] = rows;

    const { id } = FoodSchema.pick({ id: true }).parse(row);
    return id;
  }

  public async searchManualFoods(
    query: string,
    limit: number,
  ): QueryResult<Food[]> {
    const statement = await this.prepareStatement(
      `SELECT * FROM foods
       WHERE source = ${FoodSource.Manual}
         AND deleted_at IS NULL
         AND (name LIKE '%' || $query || '%' OR brand LIKE '%' || $query || '%')
       ORDER BY created_at DESC
       LIMIT $limit`,
      "searchManualFoods",
    );

    if (!statement) return null;

    const result = await this.executeStatement(statement, {
      $query: query,
      $limit: limit,
    });

    if (!result) return null;

    const rows = await result.getAllAsync();
    return rows.map((row) => FoodSchema.parse(row));
  }
}
