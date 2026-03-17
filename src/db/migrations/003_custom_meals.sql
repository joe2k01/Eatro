-- =========================
-- Custom Meals (reusable meal templates)
-- =========================
CREATE TABLE IF NOT EXISTS custom_meals (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,

  energy REAL NOT NULL,
  proteins REAL NOT NULL,
  carbohydrates REAL NOT NULL,
  fat REAL NOT NULL,

  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER
);


-- =========================
-- Custom Meal Foods (ingredients of a custom meal)
-- =========================
CREATE TABLE IF NOT EXISTS custom_meal_foods (
  id INTEGER PRIMARY KEY,
  custom_meal_id INTEGER NOT NULL,
  food_id INTEGER NOT NULL,
  quantity REAL NOT NULL,
  serving_size REAL NOT NULL,

  energy REAL NOT NULL,
  proteins REAL NOT NULL,
  carbohydrates REAL NOT NULL,
  fat REAL NOT NULL,

  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_custom_meal_foods_custom_meal_id ON custom_meal_foods(custom_meal_id);
CREATE INDEX IF NOT EXISTS idx_custom_meal_foods_food_id ON custom_meal_foods(food_id);
