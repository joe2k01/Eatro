import { Spacing, SpacingKey, Dimension, DimensionSize } from "@constants/theme";
import { useMemo } from "react";

/**
 * Simplified dimension system
 * Maps spacing keys to pixel values
 */
export function intoThemeDimension(key: SpacingKey | Dimension): number {
  if (typeof key === "number") {
    // Legacy Dimension support
    return key * DimensionSize;
  }
  // New SpacingKey support
  return Spacing[key];
}

/**
 * Hook version for reactive spacing values
 */
export function useThemeDimension(key: SpacingKey | Dimension): number {
  return useMemo(() => {
    if (typeof key === "number") {
      // Legacy Dimension support
      return key * DimensionSize;
    }
    // New SpacingKey support
    return Spacing[key];
  }, [key]);
}
