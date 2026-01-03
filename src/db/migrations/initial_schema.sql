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
  type INTEGER NOT NULL,          -- enum: MealType
  custom_type TEXT,

  energy REAL NOT NULL,
  protein REAL NOT NULL,
  carbohydrates REAL NOT NULL,
  fat REAL NOT NULL,

  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_meals_type ON meals(type);


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


-- =========================
-- Days
-- =========================
CREATE TABLE IF NOT EXISTS days (
  id INTEGER PRIMARY KEY,
  start INTEGER NOT NULL,          -- Milliseconds since epoch

  energy REAL NOT NULL,
  protein REAL NOT NULL,
  carbohydrates REAL NOT NULL,
  fat REAL NOT NULL,

  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_days_start ON days(start);


-- =========================
-- Day ↔ Meals (join table)
-- =========================
CREATE TABLE IF NOT EXISTS day_meals (
  id INTEGER PRIMARY KEY,
  day_id INTEGER NOT NULL,
  meal_id INTEGER NOT NULL,

  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_day_meals_day_id ON day_meals(day_id);
CREATE INDEX IF NOT EXISTS idx_day_meals_meal_id ON day_meals(meal_id);
