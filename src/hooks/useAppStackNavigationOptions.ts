import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { useMemo } from "react";
import { Header } from "@components/navigation/Header";
import { useTheme } from "@contexts/ThemeProvider";

/**
 * Hook for the app-wide native-stack `screenOptions`.
 *
 * Why a hook?
 * - Keeps stack setup consistent across root + nested navigators.
 * - Allows access to theme for background color styling.
 *
 * How it works with the header pattern:
 * - Always uses the shared `Header` renderer, which reads `options.title`,
 *   `options.headerTitle`, `options.headerLeft`, and `options.headerRight`.
 * - Individual screens can then set their static header config on mount via
 *   `useStaticNavigationOptions(...)`.
 */
export function useAppStackNavigationOptions(): NativeStackNavigationOptions {
  const { bg } = useTheme();

  return useMemo(
    () => ({
      headerShown: true,
      header: Header,
      contentStyle: {
        backgroundColor: bg,
      },
    }),
    [bg],
  );
}
