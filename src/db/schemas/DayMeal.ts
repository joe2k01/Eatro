import { z } from "zod";
import { NullableTimestampMsSchema, SqliteIdSchema, TimestampMsSchema } from "./common";

// Matches `day_meals` table row shape (see `migrations/initial_schema.sql`)
export const DayMealSchema = z.object({
  id: SqliteIdSchema,
  day_id: SqliteIdSchema,
  meal_id: SqliteIdSchema,
  created_at: TimestampMsSchema,
  updated_at: TimestampMsSchema,
  deleted_at: NullableTimestampMsSchema,
});

export type DayMeal = z.infer<typeof DayMealSchema>;


