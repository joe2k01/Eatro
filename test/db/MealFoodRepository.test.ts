import { FoodSource, MealType } from "@db/schemas";
import {
  closeTestDb,
  createRepositories,
  createTestDb,
  finalizeRepositories,
  type TestRepositories,
} from "./helpers";
import type { SQLiteDatabase } from "expo-sqlite";

describe("MealFoodRepository", () => {
  let db: SQLiteDatabase;
  let repos: TestRepositories;

  beforeEach(async () => {
    db = await createTestDb();
    repos = createRepositories(db);
  });

  afterEach(async () => {
    await finalizeRepositories(repos);
    await closeTestDb(db);
  });

  async function seedFood(barcode: string, name: string) {
    const now = Date.now();
    return repos.food.upsertFood({
      name,
      brand: "Test",
      unit: "g",
      serving_size: 100,
      energy_per_serving: 120,
      proteins_per_serving: 8,
      carbohydrates_per_serving: 12,
      fat_per_serving: 4,
      barcode,
      source: FoodSource.Api,
      created_at: now,
      updated_at: now,
    });
  }

  it("insertMealFood inserts a row and getMealFoodsByMealId returns nested food", async () => {
    const firstFoodId = await seedFood("mf-1", "Rice");
    repos = createRepositories(db);
    const secondFoodId = await seedFood("mf-2", "Beans");
    const dayUtc = 1735689600;
    const nowMs = Date.now();

    const mealId = await repos.meal.upsertMealAndLogFoodTx(
      {
        dayUtcSeconds: dayUtc,
        type: MealType.Dinner,
        customType: null,
        foodId: firstFoodId as number,
        quantityServings: 1,
        delta: { energy: 120, proteins: 8, carbohydrates: 12, fat: 4 },
        nowMs,
      },
      repos.mealFood,
    );

    expect(mealId).not.toBeNull();
    repos = createRepositories(db);

    const inserted = await repos.mealFood.insertMealFood(
      mealId as number,
      secondFoodId as number,
      2,
      nowMs + 1,
    );

    expect(inserted).toBe(true);

    const rows = await repos.mealFood.getMealFoodsByMealId(mealId as number);
    expect(rows?.length).toBe(2);
    expect(rows?.[0]?.food?.name).toBe("Rice");
    expect(rows?.[1]?.food?.name).toBe("Beans");
  });
});
