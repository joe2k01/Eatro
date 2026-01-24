import { useTheme } from "@contexts/ThemeProvider";
import {
  BorderRadius,
  BorderRadiusKey,
  Spacing,
  SpacingKey,
  Typography,
  mapLegacyColor,
  type LegacyColorName,
} from "@constants/theme";
import { useMemo } from "react";

// Re-export useTheme from context
export { useTheme };

/**
 * Simplified theme hook that returns flat token object
 * Provides easy access to all theme tokens
 * Memoized for performance
 */
export function useThemeTokens() {
  const theme = useTheme();

  return useMemo(
    () => ({
      colors: theme,
      spacing: Spacing,
      borderRadius: BorderRadius,
      typography: Typography,
    }),
    [theme],
  );
}

/**
 * Hook to get a specific spacing value
 * Memoized for performance
 */
export function useSpacing(key: SpacingKey): number {
  return useMemo(() => Spacing[key], [key]);
}

/**
 * Hook to get a specific border radius value
 * Memoized for performance
 */
export function useBorderRadius(key: BorderRadiusKey): number {
  return useMemo(() => BorderRadius[key], [key]);
}

/**
 * Legacy color support - maps old color names to new token structure
 * This allows gradual migration without breaking existing code
 * Memoized for performance
 */
export function useLegacyColor(legacyName: LegacyColorName): string {
  const theme = useTheme();
  return useMemo(() => mapLegacyColor(theme, legacyName), [theme, legacyName]);
}
