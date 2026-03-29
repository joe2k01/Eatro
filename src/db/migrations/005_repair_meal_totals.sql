-- Recompute meal macro aggregates from active meal_foods lines and food rows
-- (same formula as lineMacrosForLoggedLine in MealRepository).

UPDATE meals
SET
  energy = COALESCE(
    (
      SELECT SUM(
        mf.quantity
        * f.energy_per_serving
        * (
          mf.serving_size * 1.0
          / CASE
            WHEN f.serving_size > 0 THEN f.serving_size
            ELSE 1
          END
        )
      )
      FROM meal_foods mf
      INNER JOIN foods f ON mf.food_id = f.id
      WHERE
        mf.meal_id = meals.id
        AND mf.deleted_at IS NULL
        AND f.deleted_at IS NULL
    ),
    0
  ),
  proteins = COALESCE(
    (
      SELECT SUM(
        mf.quantity
        * f.proteins_per_serving
        * (
          mf.serving_size * 1.0
          / CASE
            WHEN f.serving_size > 0 THEN f.serving_size
            ELSE 1
          END
        )
      )
      FROM meal_foods mf
      INNER JOIN foods f ON mf.food_id = f.id
      WHERE
        mf.meal_id = meals.id
        AND mf.deleted_at IS NULL
        AND f.deleted_at IS NULL
    ),
    0
  ),
  carbohydrates = COALESCE(
    (
      SELECT SUM(
        mf.quantity
        * f.carbohydrates_per_serving
        * (
          mf.serving_size * 1.0
          / CASE
            WHEN f.serving_size > 0 THEN f.serving_size
            ELSE 1
          END
        )
      )
      FROM meal_foods mf
      INNER JOIN foods f ON mf.food_id = f.id
      WHERE
        mf.meal_id = meals.id
        AND mf.deleted_at IS NULL
        AND f.deleted_at IS NULL
    ),
    0
  ),
  fat = COALESCE(
    (
      SELECT SUM(
        mf.quantity
        * f.fat_per_serving
        * (
          mf.serving_size * 1.0
          / CASE
            WHEN f.serving_size > 0 THEN f.serving_size
            ELSE 1
          END
        )
      )
      FROM meal_foods mf
      INNER JOIN foods f ON mf.food_id = f.id
      WHERE
        mf.meal_id = meals.id
        AND mf.deleted_at IS NULL
        AND f.deleted_at IS NULL
    ),
    0
  ),
  updated_at = CAST(strftime('%s', 'now') AS INTEGER) * 1000
WHERE deleted_at IS NULL;

UPDATE meals
SET
  deleted_at = CAST(strftime('%s', 'now') AS INTEGER) * 1000,
  updated_at = CAST(strftime('%s', 'now') AS INTEGER) * 1000
WHERE
  deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM meal_foods mf
    WHERE mf.meal_id = meals.id AND mf.deleted_at IS NULL
  );
