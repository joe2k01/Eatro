import { FoodSource } from "@db/schemas";
import {
  closeTestDb,
  createRepositories,
  createTestDb,
  finalizeRepositories,
  type TestRepositories,
} from "../../../test/helpers/database";
import type { SQLiteDatabase } from "expo-sqlite";

const defaultFood = {
  brand: "Test",
  unit: "g",
  serving_size: 100,
  energy_per_serving: 150,
  proteins_per_serving: 12,
  carbohydrates_per_serving: 18,
  fat_per_serving: 6,
  source: FoodSource.Api,
};

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
      ...defaultFood,
      name,
      barcode,
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

  it("inserts a custom meal food and retrieves it", async () => {
    const mealId = await seedCustomMeal("Test Meal");
    const foodId = await seedFood("cmf-1", "Pasta");
    const nowMs = Date.now();

    const insertedId = await repos.customMealFood.insertCustomMealFood({
      customMealId: mealId as number,
      foodId: foodId as number,
      name: "Pasta",
      brand: "Test",
      quantity: 2,
      servingSize: 120,
      energy: 300,
      proteins: 24,
      carbohydrates: 36,
      fat: 12,
      nowMs,
    });

    expect(insertedId).toEqual(expect.any(Number));

    const foods = await repos.customMealFood.getFoodsByCustomMealId(
      mealId as number,
    );
    expect(foods).not.toBeNull();
    expect(foods?.length).toBe(1);

    const first = foods![0];
    expect(first.name).toBe("Pasta");
    expect(first.quantity).toBe(2);
    expect(first.serving_size).toBe(120);
    expect(first.energy).toBe(300);
    expect(first.proteins).toBe(24);
    expect(first.carbohydrates).toBe(36);
    expect(first.fat).toBe(12);
    expect(first.barcode).toBe("cmf-1");
  });

  it("retrieves multiple foods for a custom meal in creation order", async () => {
    const mealId = await seedCustomMeal("Multi-Item Meal");
    const foodId1 = await seedFood("cmf-2", "Rice");
    const foodId2 = await seedFood("cmf-3", "Beans");
    const nowMs = Date.now();

    await repos.customMealFood.insertCustomMealFood({
      customMealId: mealId as number,
      foodId: foodId1 as number,
      name: "Rice",
      brand: "Test",
      quantity: 1,
      servingSize: 100,
      energy: 150,
      proteins: 12,
      carbohydrates: 18,
      fat: 6,
      nowMs,
    });
    await repos.customMealFood.insertCustomMealFood({
      customMealId: mealId as number,
      foodId: foodId2 as number,
      name: "Beans",
      brand: "Test",
      quantity: 1.5,
      servingSize: 80,
      energy: 200,
      proteins: 15,
      carbohydrates: 25,
      fat: 8,
      nowMs: nowMs + 1,
    });

    const foods = await repos.customMealFood.getFoodsByCustomMealId(
      mealId as number,
    );
    expect(foods?.length).toBe(2);
    expect(foods?.[0]?.name).toBe("Rice");
    expect(foods?.[1]?.name).toBe("Beans");
    expect(foods?.[0]?.barcode).toBe("cmf-2");
    expect(foods?.[1]?.barcode).toBe("cmf-3");
  });
});
