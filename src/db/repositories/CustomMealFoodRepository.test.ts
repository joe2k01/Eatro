import { FoodSource } from "@db/schemas";
import {
  closeTestDb,
  createRepositories,
  createTestDb,
  finalizeRepositories,
  type TestRepositories,
} from "../../../test/helpers/database";
import type { SQLiteDatabase } from "expo-sqlite";

describe("CustomMealFoodRepository", () => {
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
      energy_per_serving: 150,
      proteins_per_serving: 12,
      carbohydrates_per_serving: 18,
      fat_per_serving: 6,
      barcode,
      source: FoodSource.Api,
      created_at: now,
      updated_at: now,
    });
  }

  async function seedCustomMeal(name: string) {
    const nowMs = Date.now();
    return repos.customMeal.createCustomMeal({
      name,
      energy: 0,
      proteins: 0,
      carbohydrates: 0,
      fat: 0,
      nowMs,
    });
  }

  it("inserts a custom meal food and retrieves it with joined food data", async () => {
    const mealId = await seedCustomMeal("Test Meal");
    const foodId = await seedFood("cmf-1", "Pasta");
    const nowMs = Date.now();

    const inserted = await repos.customMealFood.insertCustomMealFood(
      mealId as number,
      foodId as number,
      2,
      120,
      300,
      24,
      36,
      12,
      nowMs,
    );

    expect(inserted).toBe(true);

    const foods = await repos.customMealFood.getFoodsByCustomMealId(
      mealId as number,
    );
    expect(foods).not.toBeNull();
    expect(foods?.length).toBe(1);
    expect(foods?.[0]?.food?.name).toBe("Pasta");
    expect(foods?.[0]?.quantity).toBe(2);
    expect(foods?.[0]?.serving_size).toBe(120);
    expect(foods?.[0]?.energy).toBe(300);
    expect(foods?.[0]?.proteins).toBe(24);
    expect(foods?.[0]?.carbohydrates).toBe(36);
    expect(foods?.[0]?.fat).toBe(12);
  });

  it("retrieves multiple foods for a custom meal in creation order", async () => {
    const mealId = await seedCustomMeal("Multi-Item Meal");
    const foodId1 = await seedFood("cmf-2", "Rice");
    const foodId2 = await seedFood("cmf-3", "Beans");
    const nowMs = Date.now();

    await repos.customMealFood.insertCustomMealFood(
      mealId as number,
      foodId1 as number,
      1,
      100,
      150,
      12,
      18,
      6,
      nowMs,
    );
    await repos.customMealFood.insertCustomMealFood(
      mealId as number,
      foodId2 as number,
      1.5,
      80,
      200,
      15,
      25,
      8,
      nowMs + 1,
    );

    const foods = await repos.customMealFood.getFoodsByCustomMealId(
      mealId as number,
    );
    expect(foods?.length).toBe(2);
    expect(foods?.[0]?.food?.name).toBe("Rice");
    expect(foods?.[1]?.food?.name).toBe("Beans");
  });
});
