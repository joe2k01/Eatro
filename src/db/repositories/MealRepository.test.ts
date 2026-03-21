import { FoodSource, MealType } from "@db/schemas";
import {
  closeTestDb,
  createRepositories,
  createTestDb,
  finalizeRepositories,
  type TestRepositories,
} from "../../../test/helpers/database";
import type { SQLiteDatabase } from "expo-sqlite";

const DAY_UTC_SECONDS = new Date("2025-01-01T00:00:00Z").getTime() / 1000;

const defaultFood = {
  brand: "Test",
  unit: "g",
  serving_size: 100,
  energy_per_serving: 165,
  proteins_per_serving: 31,
  carbohydrates_per_serving: 0,
  fat_per_serving: 3.6,
  source: FoodSource.Api,
};

describe("MealRepository", () => {
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

  async function seedFood(
    barcode = "food-1",
    name = "Chicken Breast",
    overrides?: Partial<typeof defaultFood>,
  ) {
    const now = Date.now();
    return repos.food.upsertFood({
      ...defaultFood,
      ...overrides,
      name,
      barcode,
      created_at: now,
      updated_at: now,
    });
  }

  it("upsertMealAndLogFoodTx inserts meal and logs meal food", async () => {
    const foodId = await seedFood();
    expect(foodId).not.toBeNull();

    const nowMs = Date.now();
    const mealId = await repos.meal.upsertMealAndLogFoodTx(
      {
        dayUtcSeconds: DAY_UTC_SECONDS,
        type: MealType.Lunch,
        customType: null,
        foodId: foodId as number,
        quantityServings: 1.5,
        delta: { energy: 247.5, proteins: 46.5, carbohydrates: 0, fat: 5.4 },
        nowMs,
      },
      repos.mealFood,
    );

    expect(mealId).toEqual(expect.any(Number));

    const meal = await repos.meal.getMealByDayUtc(
      DAY_UTC_SECONDS,
      MealType.Lunch,
      null,
    );
    expect(meal?.id).toBe(mealId);
    expect(meal?.energy).toBeGreaterThan(0);

    const mealFoods = await repos.mealFood.getMealFoodsByMealId(
      mealId as number,
    );
    expect(mealFoods?.length).toBe(1);
    expect(mealFoods?.[0]?.food_id).toBe(foodId);
    expect(mealFoods?.[0]?.food?.name).toBe("Chicken Breast");
  });

  it("upsertMealAndLogFoodTx accumulates totals on repeated upsert", async () => {
    const foodId = await seedFood();
    const nowMs = Date.now();

    await repos.meal.upsertMealAndLogFoodTx(
      {
        dayUtcSeconds: DAY_UTC_SECONDS,
        type: MealType.Breakfast,
        customType: null,
        foodId: foodId as number,
        quantityServings: 1,
        delta: { energy: 100, proteins: 10, carbohydrates: 5, fat: 2 },
        nowMs,
      },
      repos.mealFood,
    );
    const firstMeal = await repos.meal.getMealByDayUtc(
      DAY_UTC_SECONDS,
      MealType.Breakfast,
      null,
    );
    expect(firstMeal?.energy).toBeGreaterThan(0);

    await repos.meal.upsertMealAndLogFoodTx(
      {
        dayUtcSeconds: DAY_UTC_SECONDS,
        type: MealType.Breakfast,
        customType: null,
        foodId: foodId as number,
        quantityServings: 2,
        delta: { energy: 200, proteins: 20, carbohydrates: 10, fat: 4 },
        nowMs: nowMs + 1,
      },
      repos.mealFood,
    );

    const meal = await repos.meal.getMealByDayUtc(
      DAY_UTC_SECONDS,
      MealType.Breakfast,
      null,
    );
    expect(meal?.energy).toBeGreaterThan(firstMeal?.energy ?? 0);
    expect(meal?.proteins).toBeGreaterThan(firstMeal?.proteins ?? 0);
    expect(meal?.carbohydrates).toBeGreaterThan(firstMeal?.carbohydrates ?? 0);
    expect(meal?.fat).toBeGreaterThan(firstMeal?.fat ?? 0);

    const totals = await repos.meal.getDayTotals(DAY_UTC_SECONDS);
    expect(totals?.energy).toBe(meal?.energy);
    expect(totals?.proteins).toBe(meal?.proteins);

    const meals = await repos.meal.getMealsByDay(DAY_UTC_SECONDS);
    expect(meals?.length).toBe(1);
  });

  it("logCustomMealTx bulk-logs a saved custom meal into a diary meal", async () => {
    const riceId = await seedFood("rice-1", "Rice", {
      energy_per_serving: 130,
      proteins_per_serving: 2.7,
      carbohydrates_per_serving: 28,
      fat_per_serving: 0.3,
    });
    const chickenId = await seedFood("chicken-1", "Chicken", {
      energy_per_serving: 165,
      proteins_per_serving: 31,
      carbohydrates_per_serving: 0,
      fat_per_serving: 3.6,
    });

    const nowMs = Date.now();

    const customMealId = await repos.customMeal.createCustomMealWithFoodsTx(
      {
        name: "Rice & Chicken",
        energy: 295,
        proteins: 33.7,
        carbohydrates: 28,
        fat: 3.9,
        nowMs,
      },
      [
        {
          foodId: riceId as number,
          name: "Rice",
          brand: "Test",
          quantity: 1,
          servingSize: 100,
          energy: 130,
          proteins: 2.7,
          carbohydrates: 28,
          fat: 0.3,
        },
        {
          foodId: chickenId as number,
          name: "Chicken",
          brand: "Test",
          quantity: 1,
          servingSize: 100,
          energy: 165,
          proteins: 31,
          carbohydrates: 0,
          fat: 3.6,
        },
      ],
      repos.customMealFood,
    );

    expect(customMealId).toEqual(expect.any(Number));

    const mealId = await repos.meal.logCustomMealTx(
      {
        dayUtcSeconds: DAY_UTC_SECONDS,
        type: MealType.Lunch,
        customType: null,
        customMealId: customMealId as number,
        nowMs: nowMs + 1,
      },
      repos.customMeal,
      repos.customMealFood,
      repos.mealFood,
    );

    expect(mealId).toEqual(expect.any(Number));

    const meal = await repos.meal.getMealByDayUtc(
      DAY_UTC_SECONDS,
      MealType.Lunch,
      null,
    );
    expect(meal).not.toBeNull();
    expect(meal?.energy).toBe(295);
    expect(meal?.proteins).toBe(33.7);
    expect(meal?.carbohydrates).toBe(28);
    expect(meal?.fat).toBe(3.9);

    const mealFoods = await repos.mealFood.getMealFoodsByMealId(
      mealId as number,
    );
    expect(mealFoods?.length).toBe(2);
    expect(mealFoods?.[0]?.food?.name).toBe("Rice");
    expect(mealFoods?.[1]?.food?.name).toBe("Chicken");
  });
});
