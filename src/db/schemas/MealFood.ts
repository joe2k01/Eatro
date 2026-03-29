import { z } from "zod";
import {
  NullableTimestampMsSchema,
  SqliteIdSchema,
  TimestampMsSchema,
} from "./common";

// Matches `meal_foods` table row shape (see `migrations/initial_schema.sql` + `004_meal_foods_serving_size.sql`)
export const MealFoodSchema = z.object({
  id: SqliteIdSchema,
  meal_id: SqliteIdSchema,
  food_id: SqliteIdSchema,
  quantity: z.number(),
  /** Grams (or food unit amount) per serving for this logged line; may differ from `foods.serving_size`. */
  serving_size: z.number(),
  created_at: TimestampMsSchema,
  updated_at: TimestampMsSchema,
  deleted_at: NullableTimestampMsSchema,
});

export type MealFood = z.infer<typeof MealFoodSchema>;
