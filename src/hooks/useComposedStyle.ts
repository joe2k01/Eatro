import { useTheme } from "@contexts/ThemeProvider";
import { mapLegacyColor, type LegacyColorName, type Style } from "@constants/theme";
import { useMemo } from "react";
import { StyleProp, StyleSheet, TextStyle, ViewStyle, ImageStyle } from "react-native";

type UseComposedStyleProps<S extends Style> = {
  base?: S;
  props: S & { style?: StyleProp<S> };
};

// Color props that can accept theme tokens
const COLOR_PROPS = ["color", "backgroundColor", "borderColor"] as const;

// Legacy color names that can be resolved to theme values
const LEGACY_COLORS = new Set<LegacyColorName>([
  "bg",
  "fg",
  "card",
  "fgCard",
  "popover",
  "fgPopover",
  "primary",
  "fgPrimary",
  "secondary",
  "fgSecondary",
  "accent",
  "fgAccent",
  "muted",
  "fgMuted",
  "destructive",
  "fgDestructive",
]);

/**
 * Simplified style composition hook
 * Only handles theme token resolution for color props
 * Removed complex padding/gap/color type manipulation
 */
export function useComposedStyle<S extends Style>({
  base,
  props,
}: UseComposedStyleProps<S>): Style {
  const theme = useTheme();

  return useMemo(() => {
    // Resolve theme color tokens in props
    const resolvedProps = resolveThemeColors(props, theme);

    // Resolve theme color tokens in base
    const resolvedBase = base ? resolveThemeColors(base, theme) : ({} as S);

    // Compose styles
    const propsStyle = StyleSheet.compose<S, S, S>(resolvedBase, resolvedProps);
    return StyleSheet.flatten(StyleSheet.compose(propsStyle, props.style));
  }, [base, props, theme]) as S;
}

/**
 * Resolves theme color tokens in style objects
 * Supports legacy color names for backward compatibility
 */
function resolveThemeColors<S extends Style>(
  style: S,
  theme: ReturnType<typeof useTheme>,
): S {
  const resolved = { ...style };

  for (const prop of COLOR_PROPS) {
    if (prop in style && typeof style[prop] === "string") {
      const value = style[prop] as string;
      // Check if it's a legacy color name
      if (LEGACY_COLORS.has(value as LegacyColorName)) {
        resolved[prop] = mapLegacyColor(
          theme,
          value as LegacyColorName,
        ) as S[keyof S];
      }
      // If it's not a theme token, keep the original value (e.g., "#fff", "transparent")
    }
  }

  return resolved;
}
