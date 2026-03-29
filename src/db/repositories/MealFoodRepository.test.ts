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

const SEED_FOOD = {
  brand: "Test",
  unit: "g",
  serving_size: 100,
  energy_per_serving: 120,
  proteins_per_serving: 8,
  carbohydrates_per_serving: 12,
  fat_per_serving: 4,
  source: FoodSource.Api,
} as const;

const QUANTITY_OATS_LOGGED = 1.5;
const QUANTITY_AFTER_UPDATE = 2.25;
const QUANTITY_BEANS_LINE = 2;

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
      ...SEED_FOOD,
      name,
      barcode,
      created_at: now,
      updated_at: now,
    });
  }

  it("insertMealFood inserts a row and getMealFoodsByMealId returns nested food", async () => {
    const firstFoodId = await seedFood("mf-1", "Rice");
    const secondFoodId = await seedFood("mf-2", "Beans");
    const nowMs = Date.now();

    const mealId = await repos.meal.upsertMealAndLogFoodTx(
      {
        dayUtcSeconds: DAY_UTC_SECONDS,
        type: MealType.Dinner,
        customType: null,
        foodId: firstFoodId as number,
        quantityServings: 1,
        lineServingSize: SEED_FOOD.serving_size,
        nowMs,
      },
      repos.mealFood,
    );

    expect(mealId).not.toBeNull();

    const inserted = await repos.mealFood.insertMealFood(
      mealId as number,
      secondFoodId as number,
      QUANTITY_BEANS_LINE,
      SEED_FOOD.serving_size,
      nowMs + 1,
    );

    expect(inserted).toBe(true);

    const rows = await repos.mealFood.getMealFoodsByMealId(mealId as number);
    expect(rows?.length).toBe(2);
    expect(rows?.[0]?.food?.name).toBe("Rice");
    expect(rows?.[1]?.food?.name).toBe("Beans");
  });

  it("getMealFoodWithFoodById returns a row and softDeleteMealFood marks deleted_at", async () => {
    const foodId = await seedFood("mf-by-id", "Oats");
    const nowMs = Date.now();
    const mealId = await repos.meal.upsertMealAndLogFoodTx(
      {
        dayUtcSeconds: DAY_UTC_SECONDS,
        type: MealType.Breakfast,
        customType: null,
        foodId: foodId as number,
        quantityServings: QUANTITY_OATS_LOGGED,
        lineServingSize: SEED_FOOD.serving_size,
        nowMs,
      },
      repos.mealFood,
    );
    expect(mealId).not.toBeNull();

    const listed = await repos.mealFood.getMealFoodsByMealId(mealId as number);
    const mealFoodId = listed?.[0]?.id;
    expect(mealFoodId).toEqual(expect.any(Number));

    const byId = await repos.mealFood.getMealFoodWithFoodById(
      mealFoodId as number,
    );
    expect(byId).not.toBeNull();
    expect(byId?.food.name).toBe("Oats");
    expect(byId?.quantity).toBe(QUANTITY_OATS_LOGGED);
    expect(byId?.serving_size).toBe(SEED_FOOD.serving_size);

    const deleted = await repos.mealFood.softDeleteMealFood(
      mealFoodId as number,
      nowMs + 1,
    );
    expect(deleted).toBe(true);

    const after = await repos.mealFood.getMealFoodWithFoodById(
      mealFoodId as number,
    );
    expect(after).toBeNull();

    const listedAfter = await repos.mealFood.getMealFoodsByMealId(
      mealId as number,
    );
    expect(listedAfter?.length).toBe(0);
  });

  it("updateMealFoodLine updates quantity and serving_size", async () => {
    const foodId = await seedFood("mf-qty", "Yogurt");
    const nowMs = Date.now();
    const mealId = await repos.meal.upsertMealAndLogFoodTx(
      {
        dayUtcSeconds: DAY_UTC_SECONDS,
        type: MealType.Snack,
        customType: null,
        foodId: foodId as number,
        quantityServings: 1,
        lineServingSize: SEED_FOOD.serving_size,
        nowMs,
      },
      repos.mealFood,
    );
    expect(mealId).not.toBeNull();

    const listed = await repos.mealFood.getMealFoodsByMealId(mealId as number);
    const mealFoodId = listed?.[0]?.id as number;

    const updated = await repos.mealFood.updateMealFoodLine(
      mealFoodId,
      QUANTITY_AFTER_UPDATE,
      SEED_FOOD.serving_size,
      nowMs + 1,
    );
    expect(updated).toBe(true);

    const again = await repos.mealFood.getMealFoodWithFoodById(mealFoodId);
    expect(again?.quantity).toBe(QUANTITY_AFTER_UPDATE);
    expect(again?.serving_size).toBe(SEED_FOOD.serving_size);
  });
});
