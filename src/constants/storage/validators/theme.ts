import { z } from "zod";

export const themeValidator = z.literal("light").or(z.literal("dark"));

export type Theme = z.infer<typeof themeValidator>;
