-- Per-line serving size for logged meal foods (may differ from catalogue default).
ALTER TABLE meal_foods ADD COLUMN serving_size REAL;

UPDATE meal_foods
SET serving_size = COALESCE(
  (
    SELECT f.serving_size
    FROM foods f
    WHERE f.id = meal_foods.food_id
  ),
  100
)
WHERE serving_size IS NULL;
