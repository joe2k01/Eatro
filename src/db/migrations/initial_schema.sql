-- =========================
-- Foods
-- =========================
CREATE TABLE IF NOT EXISTS foods (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  unit TEXT NOT NULL,
  serving_size REAL NOT NULL,
  energy_per_serving REAL NOT NULL,
  proteins_per_serving REAL NOT NULL,
  carbohydrates_per_serving REAL NOT NULL,
  fat_per_serving REAL NOT NULL,
  barcode TEXT UNIQUE,
  source INTEGER NOT NULL, -- enum: FoodSource

  -- sync fields (future-proofing)
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_foods_barcode ON foods(barcode);


-- =========================
-- Meals
-- =========================
CREATE TABLE IF NOT EXISTS meals (
  id INTEGER PRIMARY KEY,
  day_utc INTEGER NOT NULL,         -- Seconds since epoch (UTC start-of-day)
  type INTEGER NOT NULL,          -- enum: MealType
  custom_type TEXT,

  energy REAL NOT NULL,
  proteins REAL NOT NULL,
  carbohydrates REAL NOT NULL,
  fat REAL NOT NULL,

  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_meals_type ON meals(type);
CREATE INDEX IF NOT EXISTS idx_meals_day_utc ON meals(day_utc);
CREATE INDEX IF NOT EXISTS idx_meals_day_utc_type ON meals(day_utc, type);
-- Uniqueness for standard meals (no custom_type): one per day + type
CREATE UNIQUE INDEX IF NOT EXISTS idx_meals_day_utc_type_unique
  ON meals(day_utc, type)
  WHERE custom_type IS NULL;
-- Uniqueness for custom meals: one per day + type + custom_type
CREATE UNIQUE INDEX IF NOT EXISTS idx_meals_day_utc_type_custom_unique
  ON meals(day_utc, type, custom_type)
  WHERE custom_type IS NOT NULL;


-- =========================
-- Meal ↔ Foods (join table)
-- =========================
CREATE TABLE IF NOT EXISTS meal_foods (
  id INTEGER PRIMARY KEY,
  meal_id INTEGER NOT NULL,
  food_id INTEGER NOT NULL,
  quantity REAL NOT NULL,      -- number of servings

  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_meal_foods_meal_id ON meal_foods(meal_id);
CREATE INDEX IF NOT EXISTS idx_meal_foods_food_id ON meal_foods(food_id);

