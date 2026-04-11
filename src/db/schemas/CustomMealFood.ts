import { z } from "zod";
import {
  NullableTimestampMsSchema,
  SqliteIdSchema,
  TimestampMsSchema,
} from "./common";

export const CustomMealFoodSchema = z.object({
  id: SqliteIdSchema,
  custom_meal_id: SqliteIdSchema,
  food_id: SqliteIdSchema,
  name: z.string().min(1),
  brand: z.string().nullable(),
  quantity: z.number(),
  serving_size: z.number(),

  energy: z.number(),
  proteins: z.number(),
  carbohydrates: z.number(),
  fat: z.number(),

  created_at: TimestampMsSchema,
  updated_at: TimestampMsSchema,
  deleted_at: NullableTimestampMsSchema,
});

export type CustomMealFood = z.infer<typeof CustomMealFoodSchema>;

export const CustomMealFoodWithBarcodeSchema = CustomMealFoodSchema.extend({
  barcode: z.string().nullable(),
});

export type CustomMealFoodWithBarcode = z.infer<
  typeof CustomMealFoodWithBarcodeSchema
>;
