import { FoodSource } from "@db/schemas";
import {
  closeTestDb,
  createRepositories,
  createTestDb,
  finalizeRepositories,
  type TestRepositories,
} from "../../../test/helpers/database";
import type { SQLiteDatabase } from "expo-sqlite";

describe("FoodRepository", () => {
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

  function getBaseFood(
    source: FoodSource,
    overrides?: Partial<Record<string, unknown>>,
  ) {
    const now = Date.now();
    return {
      name: "Greek Yogurt",
      brand: "Acme",
      unit: "g",
      serving_size: 170,
      energy_per_serving: 200,
      proteins_per_serving: 20,
      carbohydrates_per_serving: 10,
      fat_per_serving: 4,
      barcode: source === FoodSource.Manual ? null : "1234567890",
      source,
      created_at: now,
      updated_at: now,
      ...overrides,
    };
  }

  it("upsertFood inserts and returns an id", async () => {
    const id = await repos.food.upsertFood(getBaseFood(FoodSource.Api));

    expect(id).toEqual(expect.any(Number));
  });

  it("upsertFood updates existing API item on barcode conflict", async () => {
    const foodData = getBaseFood(FoodSource.Api);
    const originalId = await repos.food.upsertFood(foodData);
    const updatedId = await repos.food.upsertFood({
      ...foodData,
      name: "Greek Yogurt Updated",
      proteins_per_serving: 22,
    });

    expect(updatedId).toBe(originalId);

    const food = await repos.food.getFoodByIdentifier({
      id: originalId as number,
    });
    expect(food?.name).toBe("Greek Yogurt Updated");
    expect(food?.proteins_per_serving).toBe(22);
  });

  it("getFoodByIdentifier supports id, barcode, and name", async () => {
    const foodData = getBaseFood(FoodSource.Api);
    const id = await repos.food.upsertFood(foodData);
    expect(id).not.toBeNull();

    const byId = await repos.food.getFoodByIdentifier({ id: id as number });
    const byBarcode = await repos.food.getFoodByIdentifier({
      barcode: foodData.barcode as string,
    });
    const byName = await repos.food.getFoodByIdentifier({
      name: foodData.name,
    });

    expect(byId?.id).toBe(id);
    expect(byBarcode?.id).toBe(id);
    expect(byName?.id).toBe(id);
  });

  it("searchManualFoods filters and respects limit", async () => {
    const now = Date.now();
    await repos.food.upsertFood(
      getBaseFood(FoodSource.Manual, {
        name: "Apple",
        brand: "Farm",
        created_at: now - 1000,
      }),
    );
    await repos.food.upsertFood(
      getBaseFood(FoodSource.Manual, {
        name: "Banana",
        brand: "Farm",
        created_at: now,
      }),
    );
    await repos.food.upsertFood(
      getBaseFood(FoodSource.Api, { barcode: "999999", name: "API Food" }),
    );

    // Filtering: both manual foods match "a", API food is excluded; ordered by created_at DESC
    const all = await repos.food.searchManualFoods("  a ", 10);
    expect(all).toHaveLength(2);
    expect(all?.[0]?.name).toBe("Banana");
    expect(all?.[1]?.name).toBe("Apple");

    // Limit: only the most recent match is returned
    const limited = await repos.food.searchManualFoods("  a ", 1);
    expect(limited).toHaveLength(1);
    expect(limited?.[0]?.name).toBe("Banana");
  });

  it("upsertFood returns null for duplicate manual name/brand", async () => {
    const foodData = getBaseFood(FoodSource.Manual, {
      name: "Duplicate Manual",
      brand: "BrandX",
    });

    await repos.food.upsertFood(foodData);
    const result = await repos.food.upsertFood(foodData);

    expect(result).toBeNull();
  });
});
