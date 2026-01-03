import { z } from "zod";
import { NullableTimestampMsSchema, SqliteIdSchema, TimestampMsSchema } from "./common";

// Matches `days` table row shape (see `migrations/initial_schema.sql`)
export const DaySchema = z.object({
  id: SqliteIdSchema,
  start: TimestampMsSchema, // Milliseconds since epoch

  energy: z.number(),
  protein: z.number(),
  carbohydrates: z.number(),
  fat: z.number(),

  created_at: TimestampMsSchema,
  updated_at: TimestampMsSchema,
  deleted_at: NullableTimestampMsSchema,
});

export type Day = z.infer<typeof DaySchema>;


