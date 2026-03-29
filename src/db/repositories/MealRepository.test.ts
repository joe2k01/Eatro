import { FoodSource, MealType } from "@db/schemas";
import {
  closeTestDb,
  createRepositories,
  createTestDb,
  finalizeRepositories,
  type TestRepositories,
} from "../../../test/helpers/database";
import type { SQLiteDatabase } from "expo-sqlite";
import { lineMacrosForLoggedLine } from "./MealRepository";

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

/** Half / double catalogue serving — used when tests need a line size different from `defaultFood.serving_size`. */
const halfCatalogueServing = defaultFood.serving_size / 2;
const doubleCatalogueServing = defaultFood.serving_size * 2;

/** Jest `toBeCloseTo` second argument: decimal places checked after the decimal point. */
const EXPECT_CLOSE_TO_DECIMALS = 5;

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

  it("upsertMealAndLogFoodTx inserts meal and logs meal food with line serving_size", async () => {
    const foodId = await seedFood();
    expect(foodId).not.toBeNull();

    const lineServing = defaultFood.serving_size;
    const nowMs = Date.now();
    const mealId = await repos.meal.upsertMealAndLogFoodTx(
      {
        dayUtcSeconds: DAY_UTC_SECONDS,
        type: MealType.Lunch,
        customType: null,
        foodId: foodId as number,
        quantityServings: 1.5,
        lineServingSize: lineServing,
        delta: lineMacrosForLoggedLine(1.5, lineServing, defaultFood),
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
    expect(mealFoods?.[0]?.serving_size).toBe(lineServing);
  });

  it("upsertMealAndLogFoodTx accumulates totals on repeated upsert", async () => {
    const accumFood = { ...defaultFood, carbohydrates_per_serving: 5 };
    const foodId = await seedFood("accum-1", "AccumFood", {
      carbohydrates_per_serving: 5,
    });
    const nowMs = Date.now();
    const lineServing = accumFood.serving_size;

    await repos.meal.upsertMealAndLogFoodTx(
      {
        dayUtcSeconds: DAY_UTC_SECONDS,
        type: MealType.Breakfast,
        customType: null,
        foodId: foodId as number,
        quantityServings: 1,
        lineServingSize: lineServing,
        delta: lineMacrosForLoggedLine(1, lineServing, accumFood),
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
        lineServingSize: lineServing,
        delta: lineMacrosForLoggedLine(2, lineServing, accumFood),
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
          servingSize: defaultFood.serving_size,
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
          servingSize: defaultFood.serving_size,
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
    expect(mealFoods?.[0]?.serving_size).toBe(defaultFood.serving_size);
    expect(mealFoods?.[1]?.serving_size).toBe(defaultFood.serving_size);
  });

  it("deleteMealFoodTx removes the line and subtracts meal macros", async () => {
    const foodId = await seedFood("del-1", "Apple");
    const nowMs = Date.now();
    const q = 2;
    const lineServing = defaultFood.serving_size;
    const lineDelta = lineMacrosForLoggedLine(q, lineServing, defaultFood);
    const mealId = await repos.meal.upsertMealAndLogFoodTx(
      {
        dayUtcSeconds: DAY_UTC_SECONDS,
        type: MealType.Lunch,
        customType: null,
        foodId: foodId as number,
        quantityServings: q,
        lineServingSize: lineServing,
        delta: lineDelta,
        nowMs,
      },
      repos.mealFood,
    );
    expect(mealId).not.toBeNull();

    const mealBefore = await repos.meal.getMealByDayUtc(
      DAY_UTC_SECONDS,
      MealType.Lunch,
      null,
    );
    expect(mealBefore?.energy).toBeGreaterThan(0);

    const rows = await repos.mealFood.getMealFoodsByMealId(mealId as number);
    const mealFoodId = rows?.[0]?.id as number;

    const ok = await repos.meal.deleteMealFoodTx(
      { mealFoodId, nowMs: nowMs + 1 },
      repos.mealFood,
    );
    expect(ok).toBe(true);

    const mealAfter = await repos.meal.getMealByDayUtc(
      DAY_UTC_SECONDS,
      MealType.Lunch,
      null,
    );
    expect(mealAfter).not.toBeNull();
    expect(mealAfter?.energy).toBeCloseTo(
      (mealBefore?.energy ?? 0) - lineDelta.energy,
      EXPECT_CLOSE_TO_DECIMALS,
    );

    const foodsAfter = await repos.mealFood.getMealFoodsByMealId(
      mealId as number,
    );
    expect(foodsAfter?.length).toBe(0);
  });

  it("updateMealFoodTx changes quantity only and adjusts meal macros", async () => {
    const foodId = await seedFood("upd-1", "Banana");
    const nowMs = Date.now();
    const lineServing = defaultFood.serving_size;
    const mealId = await repos.meal.upsertMealAndLogFoodTx(
      {
        dayUtcSeconds: DAY_UTC_SECONDS,
        type: MealType.Dinner,
        customType: null,
        foodId: foodId as number,
        quantityServings: 1,
        lineServingSize: lineServing,
        delta: lineMacrosForLoggedLine(1, lineServing, defaultFood),
        nowMs,
      },
      repos.mealFood,
    );
    expect(mealId).not.toBeNull();

    const mealBefore = await repos.meal.getMealByDayUtc(
      DAY_UTC_SECONDS,
      MealType.Dinner,
      null,
    );

    const listed = await repos.mealFood.getMealFoodsByMealId(mealId as number);
    const mealFoodId = listed?.[0]?.id as number;

    const newQty = 2;
    const newLine = lineMacrosForLoggedLine(newQty, lineServing, defaultFood);

    const ok = await repos.meal.updateMealFoodTx(
      {
        mealFoodId,
        newQuantityServings: newQty,
        newServingSize: lineServing,
        nowMs: nowMs + 1,
      },
      repos.mealFood,
    );
    expect(ok).toBe(true);

    const mealAfter = await repos.meal.getMealByDayUtc(
      DAY_UTC_SECONDS,
      MealType.Dinner,
      null,
    );
    const oldLine = lineMacrosForLoggedLine(1, lineServing, defaultFood);
    expect(mealAfter?.energy).toBeCloseTo(
      (mealBefore?.energy ?? 0) + newLine.energy - oldLine.energy,
      EXPECT_CLOSE_TO_DECIMALS,
    );

    const row = await repos.mealFood.getMealFoodWithFoodById(mealFoodId);
    expect(row?.quantity).toBe(2);
    expect(row?.serving_size).toBe(lineServing);
  });

  it("updateMealFoodTx changes serving size and persists line contribution", async () => {
    const foodId = await seedFood("srv-1", "Oats");
    const nowMs = Date.now();
    const catalogueServing = defaultFood.serving_size;
    const mealId = await repos.meal.upsertMealAndLogFoodTx(
      {
        dayUtcSeconds: DAY_UTC_SECONDS,
        type: MealType.Breakfast,
        customType: null,
        foodId: foodId as number,
        quantityServings: 1,
        lineServingSize: catalogueServing,
        delta: lineMacrosForLoggedLine(1, catalogueServing, defaultFood),
        nowMs,
      },
      repos.mealFood,
    );
    expect(mealId).not.toBeNull();

    const mealBefore = await repos.meal.getMealByDayUtc(
      DAY_UTC_SECONDS,
      MealType.Breakfast,
      null,
    );

    const listed = await repos.mealFood.getMealFoodsByMealId(mealId as number);
    const mealFoodId = listed?.[0]?.id as number;

    const newLineServing = halfCatalogueServing;
    const ok = await repos.meal.updateMealFoodTx(
      {
        mealFoodId,
        newQuantityServings: 1,
        newServingSize: newLineServing,
        nowMs: nowMs + 1,
      },
      repos.mealFood,
    );
    expect(ok).toBe(true);

    const mealAfter = await repos.meal.getMealByDayUtc(
      DAY_UTC_SECONDS,
      MealType.Breakfast,
      null,
    );
    const oldLine = lineMacrosForLoggedLine(1, catalogueServing, defaultFood);
    const newLine = lineMacrosForLoggedLine(1, newLineServing, defaultFood);
    expect(mealAfter?.energy).toBeCloseTo(
      (mealBefore?.energy ?? 0) + newLine.energy - oldLine.energy,
      EXPECT_CLOSE_TO_DECIMALS,
    );

    const row = await repos.mealFood.getMealFoodWithFoodById(mealFoodId);
    expect(row?.serving_size).toBe(newLineServing);
  });

  it("delete after serving-size edit subtracts the updated line contribution", async () => {
    const foodId = await seedFood("del2-1", "Bar");
    const nowMs = Date.now();
    const catalogueServing = defaultFood.serving_size;
    const mealId = await repos.meal.upsertMealAndLogFoodTx(
      {
        dayUtcSeconds: DAY_UTC_SECONDS,
        type: MealType.Snack,
        customType: null,
        foodId: foodId as number,
        quantityServings: 1,
        lineServingSize: catalogueServing,
        delta: lineMacrosForLoggedLine(1, catalogueServing, defaultFood),
        nowMs,
      },
      repos.mealFood,
    );
    expect(mealId).not.toBeNull();

    const listed = await repos.mealFood.getMealFoodsByMealId(mealId as number);
    const mealFoodId = listed?.[0]?.id as number;

    await repos.meal.updateMealFoodTx(
      {
        mealFoodId,
        newQuantityServings: 1,
        newServingSize: doubleCatalogueServing,
        nowMs: nowMs + 1,
      },
      repos.mealFood,
    );

    const mealBeforeDelete = await repos.meal.getMealByDayUtc(
      DAY_UTC_SECONDS,
      MealType.Snack,
      null,
    );

    const expectedLine = lineMacrosForLoggedLine(
      1,
      doubleCatalogueServing,
      defaultFood,
    );

    await repos.meal.deleteMealFoodTx(
      { mealFoodId, nowMs: nowMs + 2 },
      repos.mealFood,
    );

    const mealAfter = await repos.meal.getMealByDayUtc(
      DAY_UTC_SECONDS,
      MealType.Snack,
      null,
    );
    expect(mealAfter?.energy).toBeCloseTo(
      (mealBeforeDelete?.energy ?? 0) - expectedLine.energy,
      EXPECT_CLOSE_TO_DECIMALS,
    );
  });

  it("repeated edits do not drift from formula-based totals", async () => {
    const foodId = await seedFood("drift-1", "Yogurt");
    const nowMs = Date.now();
    const mealId = await repos.meal.upsertMealAndLogFoodTx(
      {
        dayUtcSeconds: DAY_UTC_SECONDS,
        type: MealType.Lunch,
        customType: null,
        foodId: foodId as number,
        quantityServings: 1,
        lineServingSize: defaultFood.serving_size,
        delta: lineMacrosForLoggedLine(
          1,
          defaultFood.serving_size,
          defaultFood,
        ),
        nowMs,
      },
      repos.mealFood,
    );
    expect(mealId).not.toBeNull();

    const listed = await repos.mealFood.getMealFoodsByMealId(mealId as number);
    const mealFoodId = listed?.[0]?.id as number;

    await repos.meal.updateMealFoodTx(
      {
        mealFoodId,
        newQuantityServings: 2,
        newServingSize: defaultFood.serving_size,
        nowMs: nowMs + 1,
      },
      repos.mealFood,
    );
    await repos.meal.updateMealFoodTx(
      {
        mealFoodId,
        newQuantityServings: 2,
        newServingSize: halfCatalogueServing,
        nowMs: nowMs + 2,
      },
      repos.mealFood,
    );
    await repos.meal.updateMealFoodTx(
      {
        mealFoodId,
        newQuantityServings: 1,
        newServingSize: defaultFood.serving_size,
        nowMs: nowMs + 3,
      },
      repos.mealFood,
    );

    const meal = await repos.meal.getMealByDayUtc(
      DAY_UTC_SECONDS,
      MealType.Lunch,
      null,
    );
    const expected = lineMacrosForLoggedLine(
      1,
      defaultFood.serving_size,
      defaultFood,
    );
    expect(meal?.energy).toBeCloseTo(expected.energy, EXPECT_CLOSE_TO_DECIMALS);
    expect(meal?.proteins).toBeCloseTo(
      expected.proteins,
      EXPECT_CLOSE_TO_DECIMALS,
    );
  });

  it("regression: legacy quantity-only line math disagrees when line serving_size differs from catalogue", async () => {
    const foodId = await seedFood("reg-1", "Muffin");
    const nowMs = Date.now();
    const lineServing = doubleCatalogueServing;
    const qty = 1;
    const trueLine = lineMacrosForLoggedLine(qty, lineServing, defaultFood);
    const wrongCatalogueOnly = {
      energy: qty * defaultFood.energy_per_serving,
      proteins: qty * defaultFood.proteins_per_serving,
      carbohydrates: qty * defaultFood.carbohydrates_per_serving,
      fat: qty * defaultFood.fat_per_serving,
    };

    expect(trueLine.energy).not.toBeCloseTo(
      wrongCatalogueOnly.energy,
      EXPECT_CLOSE_TO_DECIMALS,
    );

    const mealId = await repos.meal.upsertMealAndLogFoodTx(
      {
        dayUtcSeconds: DAY_UTC_SECONDS,
        type: MealType.Dinner,
        customType: null,
        foodId: foodId as number,
        quantityServings: qty,
        lineServingSize: lineServing,
        delta: trueLine,
        nowMs,
      },
      repos.mealFood,
    );
    expect(mealId).not.toBeNull();

    const rows = await repos.mealFood.getMealFoodsByMealId(mealId as number);
    const mealFoodId = rows?.[0]?.id as number;

    const mealBefore = await repos.meal.getMealByDayUtc(
      DAY_UTC_SECONDS,
      MealType.Dinner,
      null,
    );

    await repos.meal.deleteMealFoodTx(
      { mealFoodId, nowMs: nowMs + 1 },
      repos.mealFood,
    );

    const mealAfter = await repos.meal.getMealByDayUtc(
      DAY_UTC_SECONDS,
      MealType.Dinner,
      null,
    );
    expect(mealAfter?.energy).toBeCloseTo(
      (mealBefore?.energy ?? 0) - trueLine.energy,
      EXPECT_CLOSE_TO_DECIMALS,
    );
  });
});
