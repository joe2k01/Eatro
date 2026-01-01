import type { ZodType, output } from "zod";

export function safeParseOrDefault<Z extends ZodType>(
  value: unknown,
  schema: Z,
  defaultValue: output<Z>,
) {
  const res = schema.safeParse(value);

  return res.success ? res.data : defaultValue;
}
