/**
 * Converts a hex color to rgba with a specified opacity.
 * @param hexColor - Hex color string (e.g., "#FF5733" or "FF5733")
 * @param opacity - Opacity value between 0 and 1 (default: 0.2)
 * @returns rgba color string (e.g., "rgba(255, 87, 51, 0.2)")
 */
export function semiTransparent(
  hexColor: string,
  opacity: number = 0.2,
): string {
  // Remove # if present
  const hex = hexColor.startsWith("#") ? hexColor.slice(1) : hexColor;

  // Parse RGB values
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
