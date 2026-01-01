import { z } from "zod";

const coerceNumber = z.coerce.number().nonnegative().default(0);

export const nonNegativeNumber = z
  .number()
  .nonnegative()
  .or(z.string().transform((v) => coerceNumber.parse(v)));

export const optionalNonNegativeInt = nonNegativeNumber.optional();
