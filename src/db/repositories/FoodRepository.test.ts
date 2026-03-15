import { FoodSource } from "@db/schemas";
import {
  closeTestDb,
  createRepositories,
  createTestDb,
  finalizeRepositories,
  type TestRepositories,
} from "./testHelpers";
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
    const originalId = await repos.food.upsertFood(getBaseFood(FoodSource.Api));
    const updatedId = await repos.food.upsertFood(
      getBaseFood(FoodSource.Api, {
        name: "Greek Yogurt Updated",
        proteins_per_serving: 22,
      }),
    );

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

    const rows = await repos.food.searchManualFoods("  a ", 1);

    expect(rows).not.toBeNull();
    expect(rows?.length).toBe(1);
    expect(rows?.[0]?.name).toBe("Banana");
  });

  it("upsertFood returns null for duplicate manual name/brand", async () => {
    await repos.food.upsertFood(
      getBaseFood(FoodSource.Manual, {
        name: "Duplicate Manual",
        brand: "BrandX",
      }),
    );

    const result = await repos.food.upsertFood(
      getBaseFood(FoodSource.Manual, {
        name: "Duplicate Manual",
        brand: "BrandX",
      }),
    );

    expect(result).toBeNull();
  });
});
