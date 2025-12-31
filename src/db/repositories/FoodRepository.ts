import type * as SQLite from "expo-sqlite";
import type { FoodRow } from "../models";

export type InsertFoodInput = {
  name: string;
  brand?: string | null;
  barcode?: string | null;
  calories_per_gram: number;
  protein_per_gram: number;
  carbs_per_gram: number;
  fat_per_gram: number;
  source: number;
  created_at: number;
  updated_at: number;
};

export class FoodRepository {
  constructor(private readonly db: SQLite.SQLiteDatabase) {}

  async insertFood(input: InsertFoodInput): Promise<FoodRow> {
    const res = await this.db.runAsync(
      `
INSERT INTO foods (
  name, brand, barcode,
  calories_per_gram, protein_per_gram, carbs_per_gram, fat_per_gram,
  source, created_at, updated_at, deleted_at
)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL);
      `.trim(),
      [
        input.name,
        input.brand ?? null,
        input.barcode ?? null,
        input.calories_per_gram,
        input.protein_per_gram,
        input.carbs_per_gram,
        input.fat_per_gram,
        input.source,
        input.created_at,
        input.updated_at,
      ],
    );

    if (!res.lastInsertRowId || res.lastInsertRowId <= 0) {
      throw new Error("insertFood failed: no lastInsertRowId");
    }

    const row = await this.getFoodById(Number(res.lastInsertRowId));
    if (!row) throw new Error("insertFood failed: food not found after insert");
    return row;
  }

  async getFoodById(id: number): Promise<FoodRow | null> {
    return await this.db.getFirstAsync<FoodRow>(
      `
SELECT
  id, name, brand, barcode,
  calories_per_gram, protein_per_gram, carbs_per_gram, fat_per_gram,
  source, created_at, updated_at, deleted_at
FROM foods
WHERE id = ? AND deleted_at IS NULL
LIMIT 1;
      `.trim(),
      [id],
    );
  }

  async getFoodByBarcode(barcode: string): Promise<FoodRow | null> {
    return await this.db.getFirstAsync<FoodRow>(
      `
SELECT
  id, name, brand, barcode,
  calories_per_gram, protein_per_gram, carbs_per_gram, fat_per_gram,
  source, created_at, updated_at, deleted_at
FROM foods
WHERE barcode = ? AND deleted_at IS NULL
LIMIT 1;
      `.trim(),
      [barcode],
    );
  }

  async searchFoodsByName(
    query: string,
    limit: number = 25,
  ): Promise<FoodRow[]> {
    const like = `%${query.trim()}%`;
    return await this.db.getAllAsync<FoodRow>(
      `
SELECT
  id, name, brand, barcode,
  calories_per_gram, protein_per_gram, carbs_per_gram, fat_per_gram,
  source, created_at, updated_at, deleted_at
FROM foods
WHERE deleted_at IS NULL AND name LIKE ? COLLATE NOCASE
ORDER BY name ASC
LIMIT ?;
      `.trim(),
      [like, limit],
    );
  }
}
