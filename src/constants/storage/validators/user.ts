import { z } from "zod";

export const userValidator = z
  .object({
    name: z.string(),
  })
  .partial();

export type User = z.infer<typeof userValidator>;
