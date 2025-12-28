import { z } from "zod";

export const goalsValidator = z
  .object({
    calories: z.number().int().nonnegative(),
    protein: z.number().int().nonnegative(),
    carbs: z.number().int().nonnegative(),
    fat: z.number().int().nonnegative(),
  })
  .partial();

export type Goals = z.infer<typeof goalsValidator>;
