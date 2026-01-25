/**
 * Format a number or undefined to string for display in inputs.
 * undefined becomes empty string.
 */
export function formatNumber(value: number | undefined): string {
  return value === undefined ? "" : String(value);
}

/**
 * Parse a string to number or undefined for form values.
 * Empty string or invalid number becomes undefined.
 */
export function parseNumber(text: string): number | undefined {
  const num = Number(text);
  return isNaN(num) || text === "" ? undefined : num;
}
