import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { useTheme } from "@contexts/ThemeProvider";

export function useMyFoodsTabBarTheme() {
  const theme = useTheme();
  return useMemo(() => {
    const tabBarStyles = StyleSheet.create({
      bar: {
        backgroundColor: theme.surface.primary,
      },
      indicator: {
        backgroundColor: theme.semantic.primary,
      },
    });
    const androidRipple = { color: theme.semantic.secondary };
    return {
      styles: tabBarStyles,
      activeColor: theme.text.primary,
      inactiveColor: theme.text.muted,
      pressColor: theme.semantic.secondary,
      androidRipple,
    };
  }, [theme]);
}
