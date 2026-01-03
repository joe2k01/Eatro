import { type SQLiteDatabase, SQLiteStatement } from "expo-sqlite";
import { Food, FoodSchema, FoodSource } from "@db/schemas";
import * as Sentry from "@sentry/react-native";

type FoodIdentifier =
  | {
      $barcode: string;
    }
  | { $name: string };

type QueryResult<T> = Promise<T | null>;

export class FoodRepository {
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

  public async getFoodByIdentifier(
    identifier: FoodIdentifier,
  ): QueryResult<Food> {
    const statement = await this.db.prepareAsync(`
      SELECT * FROM foods
      WHERE
        ($barcode IS NOT NULL AND barcode = $barcode)
        OR
        ($name IS NOT NULL AND name = $name)
    `);

    return await this.executeStatement(statement, async () => {
      const data = await (
        await statement.executeAsync(identifier)
      ).getFirstAsync();

      if (!data) {
        return null;
      }

      return FoodSchema.parse(data);
    });
  }

  public async upsertFood(food: Omit<Food, "id" | "deleted_at">) {
    try {
      const statement = await this.db.prepareAsync(`
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
        `);

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
        $source: FoodSource.Api,
        $created_at: food.created_at,
        $updated_at: food.updated_at,
      };

      return await this.executeStatement(statement, async () => {
        const result = await statement.executeAsync(foodUpsertFormat);
        // We only upsert if the source is API, otherwise if user has manually edited or created this food we let it be.
        return result.changes > 0;
      });
    } catch (error) {
      console.error(error);
    }
  }
}
