import { Style } from "@constants/theme";
import { useTheme } from "@contexts/ThemeProvider";
import { useMemo } from "react";
import { StyleProp, StyleSheet } from "react-native";

export type ButtonVariant = "primary" | "secondary" | "transparent" | "muted";

type UseButtonStyleProps = {
  variant?: ButtonVariant;
  composedStyle: StyleProp<Style>;
};

export function useButtonStyle({
  variant,
  composedStyle,
}: UseButtonStyleProps) {
  const { primary, fgPrimary, secondary, fgSecondary, muted, fgMuted, fg } =
    useTheme();

  const outerStyle = useMemo(() => {
    let background: string = "";

    switch (variant) {
      case "primary":
        background = primary;
        break;
      case "secondary":
        background = secondary;
        break;
      case "transparent":
        break;
      case "muted":
      default:
        background = muted;
        break;
    }

    return StyleSheet.compose({ backgroundColor: background }, composedStyle);
  }, [composedStyle, muted, primary, secondary, variant]);

  const innerStyle = useMemo(() => {
    let color: string = "";
    switch (variant) {
      case "primary":
        color = fgPrimary;
        break;
      case "secondary":
        color = fgSecondary;
        break;
      case "transparent":
        color = fg;
        break;
      case "muted":
      default:
        color = fgMuted;
        break;
    }

    if (composedStyle && "color" in composedStyle) {
      return { color: composedStyle.color };
    }

    return { color };
  }, [composedStyle, fg, fgMuted, fgPrimary, fgSecondary, variant]);

  return { innerStyle, outerStyle };
}
