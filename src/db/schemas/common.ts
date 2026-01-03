import { z } from "zod";

export const SqliteIdSchema = z.number().int().nonnegative();

// Stored as INTEGER (milliseconds since epoch) in schema.
export const TimestampMsSchema = z.number().int().nonnegative();

export const NullableTimestampMsSchema = TimestampMsSchema.nullable();


