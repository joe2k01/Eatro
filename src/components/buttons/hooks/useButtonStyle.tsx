import { Style } from "@constants/theme";
import { useTheme } from "@contexts/ThemeProvider";
import { useMemo } from "react";
import { ColorValue, StyleProp, StyleSheet } from "react-native";

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

    return StyleSheet.flatten(
      StyleSheet.compose({ backgroundColor: background }, composedStyle),
    );
  }, [composedStyle, muted, primary, secondary, variant]);

  const innerStyle = useMemo(() => {
    let color: ColorValue = "";
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

    if (composedStyle && "color" in composedStyle && composedStyle.color) {
      color = composedStyle.color;
    }

    const textAlign =
      composedStyle && "textAlign" in composedStyle
        ? composedStyle.textAlign
        : "center";

    return {
      color,
      textAlign,
    };
  }, [composedStyle, fg, fgMuted, fgPrimary, fgSecondary, variant]);

  return { innerStyle, outerStyle };
}
