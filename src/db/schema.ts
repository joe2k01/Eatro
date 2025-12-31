// NOTE: These tables match the user-provided schema EXACTLY.

export const SCHEMA_V1_SQL: string[] = [
  `
CREATE TABLE IF NOT EXISTS foods (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  barcode TEXT,
  calories_per_gram REAL NOT NULL,
  protein_per_gram REAL NOT NULL,
  carbs_per_gram REAL NOT NULL,
  fat_per_gram REAL NOT NULL,
  source INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER
);
  `.trim(),
  `
CREATE TABLE IF NOT EXISTS food_entries (
  id TEXT PRIMARY KEY,
  food_id TEXT NOT NULL,
  quantity_grams REAL NOT NULL,

  calories REAL NOT NULL,
  protein REAL NOT NULL,
  carbs REAL NOT NULL,
  fat REAL NOT NULL,

  eaten_at INTEGER NOT NULL,
  day_start_ts INTEGER NOT NULL,

  meal_type INTEGER NOT NULL,
  sync_status INTEGER NOT NULL,

  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER
);
  `.trim(),
  `
CREATE TABLE IF NOT EXISTS meals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER
);
  `.trim(),
  `
CREATE TABLE IF NOT EXISTS meal_items (
  id TEXT PRIMARY KEY,
  meal_id TEXT NOT NULL,
  food_id TEXT NOT NULL,
  quantity_grams REAL NOT NULL
);
  `.trim(),
  `
CREATE TABLE IF NOT EXISTS days (
  day_start_ts INTEGER PRIMARY KEY,
  total_calories REAL NOT NULL,
  total_protein REAL NOT NULL,
  total_carbs REAL NOT NULL,
  total_fat REAL NOT NULL,
  updated_at INTEGER NOT NULL
);
  `.trim(),
];

export const INDEXES_SQL: string[] = [
  // foods(barcode) WHERE barcode IS NOT NULL AND deleted_at IS NULL
  `
CREATE INDEX IF NOT EXISTS idx_foods_barcode_active
ON foods(barcode)
WHERE barcode IS NOT NULL AND deleted_at IS NULL;
  `.trim(),

  // food_entries(day_start_ts) WHERE deleted_at IS NULL
  `
CREATE INDEX IF NOT EXISTS idx_food_entries_day_active
ON food_entries(day_start_ts)
WHERE deleted_at IS NULL;
  `.trim(),

  // food_entries(eaten_at) WHERE deleted_at IS NULL
  `
CREATE INDEX IF NOT EXISTS idx_food_entries_eaten_at_active
ON food_entries(eaten_at)
WHERE deleted_at IS NULL;
  `.trim(),

  // food_entries(food_id) WHERE deleted_at IS NULL
  `
CREATE INDEX IF NOT EXISTS idx_food_entries_food_id_active
ON food_entries(food_id)
WHERE deleted_at IS NULL;
  `.trim(),

  // food_entries(sync_status) WHERE deleted_at IS NULL
  `
CREATE INDEX IF NOT EXISTS idx_food_entries_sync_status_active
ON food_entries(sync_status)
WHERE deleted_at IS NULL;
  `.trim(),

  // meal_items(meal_id)
  `
CREATE INDEX IF NOT EXISTS idx_meal_items_meal_id
ON meal_items(meal_id);
  `.trim(),
];

// INTEGER-PK schema (v3): avoids TEXT primary keys and lets SQLite generate ids.
// Adds `sync_id BLOB DEFAULT randomblob(16)` for future sync without app-side id generation.
export const SCHEMA_V3_SQL: string[] = [
  `
CREATE TABLE IF NOT EXISTS foods (
  id INTEGER PRIMARY KEY,
  sync_id BLOB NOT NULL DEFAULT (randomblob(16)),
  name TEXT NOT NULL,
  brand TEXT,
  barcode TEXT,
  calories_per_gram REAL NOT NULL,
  protein_per_gram REAL NOT NULL,
  carbs_per_gram REAL NOT NULL,
  fat_per_gram REAL NOT NULL,
  source INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER
);
  `.trim(),
  `
CREATE TABLE IF NOT EXISTS food_entries (
  id INTEGER PRIMARY KEY,
  sync_id BLOB NOT NULL DEFAULT (randomblob(16)),
  food_id INTEGER NOT NULL,
  quantity_grams REAL NOT NULL,

  calories REAL NOT NULL,
  protein REAL NOT NULL,
  carbs REAL NOT NULL,
  fat REAL NOT NULL,

  eaten_at INTEGER NOT NULL,
  day_start_ts INTEGER NOT NULL,

  meal_type INTEGER NOT NULL,
  sync_status INTEGER NOT NULL,

  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER
);
  `.trim(),
  `
CREATE TABLE IF NOT EXISTS meals (
  id INTEGER PRIMARY KEY,
  sync_id BLOB NOT NULL DEFAULT (randomblob(16)),
  name TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER
);
  `.trim(),
  `
CREATE TABLE IF NOT EXISTS meal_items (
  id INTEGER PRIMARY KEY,
  meal_id INTEGER NOT NULL,
  food_id INTEGER NOT NULL,
  quantity_grams REAL NOT NULL
);
  `.trim(),
  `
CREATE TABLE IF NOT EXISTS days (
  day_start_ts INTEGER PRIMARY KEY,
  total_calories REAL NOT NULL,
  total_protein REAL NOT NULL,
  total_carbs REAL NOT NULL,
  total_fat REAL NOT NULL,
  updated_at INTEGER NOT NULL
);
  `.trim(),
];

export const INDEXES_V3_SQL: string[] = [
  // Keep barcode lookup fast; make it unique among active (non-deleted) foods.
  `
CREATE UNIQUE INDEX IF NOT EXISTS idx_foods_barcode_active
ON foods(barcode)
WHERE barcode IS NOT NULL AND deleted_at IS NULL;
  `.trim(),

  `
CREATE INDEX IF NOT EXISTS idx_food_entries_day_active
ON food_entries(day_start_ts)
WHERE deleted_at IS NULL;
  `.trim(),
  `
CREATE INDEX IF NOT EXISTS idx_food_entries_eaten_at_active
ON food_entries(eaten_at)
WHERE deleted_at IS NULL;
  `.trim(),
  `
CREATE INDEX IF NOT EXISTS idx_food_entries_food_id_active
ON food_entries(food_id)
WHERE deleted_at IS NULL;
  `.trim(),
  `
CREATE INDEX IF NOT EXISTS idx_food_entries_sync_status_active
ON food_entries(sync_status)
WHERE deleted_at IS NULL;
  `.trim(),
  `
CREATE INDEX IF NOT EXISTS idx_meal_items_meal_id
ON meal_items(meal_id);
  `.trim(),
  `
CREATE INDEX IF NOT EXISTS idx_foods_name_active
ON foods(name COLLATE NOCASE)
WHERE deleted_at IS NULL;
  `.trim(),
];
