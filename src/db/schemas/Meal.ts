import { z } from "zod";
import { MealTypeSchema } from "./enums";
import { NullableTimestampMsSchema, SqliteIdSchema, TimestampMsSchema } from "./common";

// Matches `meals` table row shape (see `migrations/initial_schema.sql`)
export const MealSchema = z.object({
  id: SqliteIdSchema,
  type: MealTypeSchema,
  custom_type: z.string().nullable(),

  energy: z.number(),
  protein: z.number(),
  carbohydrates: z.number(),
  fat: z.number(),

  created_at: TimestampMsSchema,
  updated_at: TimestampMsSchema,
  deleted_at: NullableTimestampMsSchema,
});

export type Meal = z.infer<typeof MealSchema>;


