import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { useMemo } from "react";
import { useTheme } from "@contexts/ThemeProvider";

/**
 * Shared stack options for app navigators.
 * Keeps screen background theming consistent across nested stacks.
 */
export function useAppStackNavigationOptions(): NativeStackNavigationOptions {
  const theme = useTheme();

  return useMemo(
    () => ({
      headerShown: false,
      contentStyle: {
        backgroundColor: theme.surface.primary,
      },
    }),
    [theme.surface.primary],
  );
}
