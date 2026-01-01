import { z } from "zod";
import { optionalNonNegativeInt } from "./numberParsers";

export const goalsValidator = z
  .object({
    calories: optionalNonNegativeInt,
    protein: optionalNonNegativeInt,
    carbs: optionalNonNegativeInt,
    fat: optionalNonNegativeInt,
  })
  .partial();

export type Goals = z.output<typeof goalsValidator>;
