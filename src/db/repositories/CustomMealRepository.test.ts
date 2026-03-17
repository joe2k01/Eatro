import { FoodSource } from "@db/schemas";
import {
  closeTestDb,
  createRepositories,
  createTestDb,
  finalizeRepositories,
  type TestRepositories,
} from "../../../test/helpers/database";
import type { SQLiteDatabase } from "expo-sqlite";

describe("CustomMealRepository", () => {
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
      energy_per_serving: 200,
      proteins_per_serving: 15,
      carbohydrates_per_serving: 25,
      fat_per_serving: 8,
      barcode,
      source: FoodSource.Api,
      created_at: now,
      updated_at: now,
    });
  }

  it("creates a custom meal and retrieves it by id", async () => {
    const nowMs = Date.now();
    const mealId = await repos.customMeal.createCustomMeal(
      {
        name: "My Supermarket Meal",
        energy: 500,
        proteins: 30,
        carbohydrates: 50,
        fat: 20,
        nowMs,
      },
    );

    expect(mealId).toEqual(expect.any(Number));

    const meal = await repos.customMeal.getCustomMealById(mealId as number);
    expect(meal).not.toBeNull();
    expect(meal?.name).toBe("My Supermarket Meal");
    expect(meal?.energy).toBe(500);
    expect(meal?.proteins).toBe(30);
    expect(meal?.carbohydrates).toBe(50);
    expect(meal?.fat).toBe(20);
  });

  it("lists all custom meals ordered by creation time desc", async () => {
    const nowMs = Date.now();
    await repos.customMeal.createCustomMeal({
      name: "Meal A",
      energy: 100,
      proteins: 10,
      carbohydrates: 10,
      fat: 5,
      nowMs,
    });
    await repos.customMeal.createCustomMeal({
      name: "Meal B",
      energy: 200,
      proteins: 20,
      carbohydrates: 20,
      fat: 10,
      nowMs: nowMs + 1,
    });

    const meals = await repos.customMeal.getAllCustomMeals();
    expect(meals).not.toBeNull();
    expect(meals?.length).toBe(2);
    expect(meals?.[0]?.name).toBe("Meal B");
    expect(meals?.[1]?.name).toBe("Meal A");
  });

  it("searches custom meals by name", async () => {
    const nowMs = Date.now();
    await repos.customMeal.createCustomMeal({
      name: "Chicken Stir Fry",
      energy: 400,
      proteins: 30,
      carbohydrates: 40,
      fat: 15,
      nowMs,
    });
    await repos.customMeal.createCustomMeal({
      name: "Salmon Bowl",
      energy: 500,
      proteins: 35,
      carbohydrates: 45,
      fat: 20,
      nowMs: nowMs + 1,
    });

    const results = await repos.customMeal.searchCustomMeals("chicken");
    expect(results).not.toBeNull();
    expect(results?.length).toBe(1);
    expect(results?.[0]?.name).toBe("Chicken Stir Fry");
  });

  it("creates a custom meal with foods in a transaction", async () => {
    const foodId1 = await seedFood("cm-1", "Rice");
    const foodId2 = await seedFood("cm-2", "Chicken");
    const nowMs = Date.now();

    const mealId = await repos.customMeal.createCustomMealWithFoodsTx(
      {
        name: "Rice and Chicken",
        energy: 450,
        proteins: 40,
        carbohydrates: 50,
        fat: 12,
        nowMs,
      },
      [
        {
          foodId: foodId1 as number,
          quantity: 1.5,
          servingSize: 100,
          energy: 200,
          proteins: 15,
          carbohydrates: 25,
          fat: 8,
        },
        {
          foodId: foodId2 as number,
          quantity: 1,
          servingSize: 150,
          energy: 250,
          proteins: 25,
          carbohydrates: 25,
          fat: 4,
        },
      ],
      repos.customMealFood,
    );

    expect(mealId).toEqual(expect.any(Number));

    const foods = await repos.customMealFood.getFoodsByCustomMealId(
      mealId as number,
    );
    expect(foods).not.toBeNull();
    expect(foods?.length).toBe(2);
    expect(foods?.[0]?.food?.name).toBe("Rice");
    expect(foods?.[1]?.food?.name).toBe("Chicken");
    expect(foods?.[0]?.quantity).toBe(1.5);
    expect(foods?.[0]?.serving_size).toBe(100);
  });
});
