import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";
import { FoodRepository } from "./FoodRepository";
import { MealRepository } from "./MealRepository";
import { MealFoodRepository } from "./MealFoodRepository";

const migrationFiles = [
  resolve(__dirname, "../migrations/initial_schema.sql"),
  resolve(__dirname, "../migrations/002_manual_foods_index.sql"),
];

let dbCounter = 0;

export async function createTestDb(): Promise<SQLiteDatabase> {
  dbCounter += 1;
  const db = await openDatabaseAsync(`test-db-${dbCounter}.db`);

  for (const migrationFile of migrationFiles) {
    const sql = await readFile(migrationFile, "utf8");
    await db.execAsync(sql);
  }

  return db;
}

export async function closeTestDb(db: SQLiteDatabase): Promise<void> {
  await db.closeAsync();
}

export function createRepositories(db: SQLiteDatabase) {
  return {
    food: new FoodRepository(db),
    meal: new MealRepository(db),
    mealFood: new MealFoodRepository(db),
  };
}

export type TestRepositories = ReturnType<typeof createRepositories>;

export async function finalizeRepositories(
  repositories: TestRepositories,
): Promise<void> {
  await Promise.all([
    repositories.food.finalize(),
    repositories.meal.finalize(),
    repositories.mealFood.finalize(),
  ]);
}
