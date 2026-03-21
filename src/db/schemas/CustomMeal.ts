import { z } from "zod";
import {
  NullableTimestampMsSchema,
  SqliteIdSchema,
  TimestampMsSchema,
} from "./common";

export const CustomMealSchema = z.object({
  id: SqliteIdSchema,
  name: z.string().min(1),

  energy: z.number(),
  proteins: z.number(),
  carbohydrates: z.number(),
  fat: z.number(),

  created_at: TimestampMsSchema,
  updated_at: TimestampMsSchema,
  deleted_at: NullableTimestampMsSchema,
});

export type CustomMeal = z.infer<typeof CustomMealSchema>;
