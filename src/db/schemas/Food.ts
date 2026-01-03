import { z } from "zod";
import { FoodSourceSchema } from "./enums";
import {
  NullableTimestampMsSchema,
  SqliteIdSchema,
  TimestampMsSchema,
} from "./common";

// Matches `foods` table row shape (see `migrations/initial_schema.sql`)
export const FoodSchema = z.object({
  id: SqliteIdSchema,
  name: z.string().min(1),
  brand: z.string().nullable(),
  unit: z.string().min(1),
  serving_size: z.number(),
  energy_per_serving: z.number(),
  proteins_per_serving: z.number(),
  carbohydrates_per_serving: z.number(),
  fat_per_serving: z.number(),
  barcode: z.string().nullable(),
  source: FoodSourceSchema,
  created_at: TimestampMsSchema,
  updated_at: TimestampMsSchema,
  deleted_at: NullableTimestampMsSchema,
});

export type Food = z.infer<typeof FoodSchema>;
