import type * as SQLite from "expo-sqlite";
import { INDEXES_V3_SQL, SCHEMA_V3_SQL } from "../schema";

type OldFoodRow = {
  id: string;
  name: string;
  brand: string | null;
  barcode: string | null;
  calories_per_gram: number;
  protein_per_gram: number;
  carbs_per_gram: number;
  fat_per_gram: number;
  source: number;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
};

type OldMealRow = {
  id: string;
  name: string;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
};

type OldEntryRow = {
  id: string;
  food_id: string;
  quantity_grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  eaten_at: number;
  day_start_ts: number;
  meal_type: number;
  sync_status: number;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
};

type OldMealItemRow = {
  id: string;
  meal_id: string;
  food_id: string;
  quantity_grams: number;
};

async function tableExists(
  db: SQLite.SQLiteDatabase,
  name: string,
): Promise<boolean> {
  const row = await db.getFirstAsync<{ c: number }>(
    `SELECT COUNT(1) AS c FROM sqlite_master WHERE type='table' AND name=?;`,
    [name],
  );
  return (row?.c ?? 0) > 0;
}

async function isTextPkFoods(db: SQLite.SQLiteDatabase): Promise<boolean> {
  const cols = await db.getAllAsync<{ name: string; type: string }>(
    `PRAGMA table_info(foods);`,
  );
  const idCol = cols.find((c) => c.name === "id");
  if (!idCol) return false;
  return (idCol.type ?? "").toUpperCase().includes("TEXT");
}

export async function migrateV3(db: SQLite.SQLiteDatabase): Promise<void> {
  // No-op if schema is already INTEGER-PK.
  if (!(await tableExists(db, "foods"))) return;
  if (!(await isTextPkFoods(db))) {
    for (const stmt of INDEXES_V3_SQL) await db.execAsync(stmt);
    return;
  }

  // Rename old tables.
  await db.execAsync(`ALTER TABLE foods RENAME TO foods__old;`);
  await db.execAsync(`ALTER TABLE food_entries RENAME TO food_entries__old;`);
  await db.execAsync(`ALTER TABLE meals RENAME TO meals__old;`);
  await db.execAsync(`ALTER TABLE meal_items RENAME TO meal_items__old;`);

  // Create new INTEGER-PK schema.
  for (const stmt of SCHEMA_V3_SQL) await db.execAsync(stmt);
  for (const stmt of INDEXES_V3_SQL) await db.execAsync(stmt);

  // Remap foods.
  const oldFoods = await db.getAllAsync<OldFoodRow>(
    `
SELECT
  id, name, brand, barcode,
  calories_per_gram, protein_per_gram, carbs_per_gram, fat_per_gram,
  source, created_at, updated_at, deleted_at
FROM foods__old;
    `.trim(),
  );

  const foodIdMap = new Map<string, number>();
  for (const f of oldFoods) {
    const res = await db.runAsync(
      `
INSERT INTO foods (
  name, brand, barcode,
  calories_per_gram, protein_per_gram, carbs_per_gram, fat_per_gram,
  source, created_at, updated_at, deleted_at
)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `.trim(),
      [
        f.name,
        f.brand,
        f.barcode,
        f.calories_per_gram,
        f.protein_per_gram,
        f.carbs_per_gram,
        f.fat_per_gram,
        f.source,
        f.created_at,
        f.updated_at,
        f.deleted_at,
      ],
    );
    foodIdMap.set(f.id, Number(res.lastInsertRowId));
  }

  // Remap meals.
  const oldMeals = await db.getAllAsync<OldMealRow>(
    `SELECT id, name, created_at, updated_at, deleted_at FROM meals__old;`,
  );
  const mealIdMap = new Map<string, number>();
  for (const m of oldMeals) {
    const res = await db.runAsync(
      `
INSERT INTO meals (name, created_at, updated_at, deleted_at)
VALUES (?, ?, ?, ?);
      `.trim(),
      [m.name, m.created_at, m.updated_at, m.deleted_at],
    );
    mealIdMap.set(m.id, Number(res.lastInsertRowId));
  }

  // Remap food_entries.
  const oldEntries = await db.getAllAsync<OldEntryRow>(
    `
SELECT
  id, food_id, quantity_grams,
  calories, protein, carbs, fat,
  eaten_at, day_start_ts,
  meal_type, sync_status,
  created_at, updated_at, deleted_at
FROM food_entries__old;
    `.trim(),
  );

  for (const e of oldEntries) {
    const newFoodId = foodIdMap.get(e.food_id);
    if (!newFoodId) continue; // orphan row; ignore during migration

    await db.runAsync(
      `
INSERT INTO food_entries (
  food_id, quantity_grams,
  calories, protein, carbs, fat,
  eaten_at, day_start_ts,
  meal_type, sync_status,
  created_at, updated_at, deleted_at
)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `.trim(),
      [
        newFoodId,
        e.quantity_grams,
        e.calories,
        e.protein,
        e.carbs,
        e.fat,
        e.eaten_at,
        e.day_start_ts,
        e.meal_type,
        e.sync_status,
        e.created_at,
        e.updated_at,
        e.deleted_at,
      ],
    );
  }

  // Remap meal_items.
  const oldItems = await db.getAllAsync<OldMealItemRow>(
    `SELECT id, meal_id, food_id, quantity_grams FROM meal_items__old;`,
  );
  for (const it of oldItems) {
    const newMealId = mealIdMap.get(it.meal_id);
    const newFoodId = foodIdMap.get(it.food_id);
    if (!newMealId || !newFoodId) continue;

    await db.runAsync(
      `
INSERT INTO meal_items (meal_id, food_id, quantity_grams)
VALUES (?, ?, ?);
      `.trim(),
      [newMealId, newFoodId, it.quantity_grams],
    );
  }

  // Drop old tables last.
  await db.execAsync(`DROP TABLE IF EXISTS foods__old;`);
  await db.execAsync(`DROP TABLE IF EXISTS food_entries__old;`);
  await db.execAsync(`DROP TABLE IF EXISTS meals__old;`);
  await db.execAsync(`DROP TABLE IF EXISTS meal_items__old;`);
}
