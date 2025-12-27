import { Style } from "@constants/theme";
import { useTheme } from "@contexts/ThemeProvider";
import { useMemo } from "react";
import { ColorValue, StyleProp, StyleSheet } from "react-native";

export type ButtonVariant = "primary" | "secondary" | "transparent" | "muted";

type UseButtonStyleProps = {
  variant?: ButtonVariant;
  composedStyle: StyleProp<Style>;
  disabled?: boolean | null;
};

export function useButtonStyle({
  variant,
  composedStyle,
  disabled,
}: UseButtonStyleProps) {
  const { primary, fgPrimary, secondary, fgSecondary, muted, fgMuted, fg } =
    useTheme();

  const outerStyle = useMemo(() => {
    let background: string = "transparent";
    const effectiveVariant: ButtonVariant | undefined = disabled
      ? "muted"
      : variant;

    switch (effectiveVariant) {
      case "primary":
        background = primary;
        break;
      case "secondary":
        background = secondary;
        break;
      case "transparent":
        background = "transparent";
        break;
      case "muted":
      default:
        background = muted;
        break;
    }

    const base = StyleSheet.flatten(
      StyleSheet.compose({ backgroundColor: background }, composedStyle),
    );

    // Disabled always falls back to the muted background, regardless of variant.
    return disabled ? { ...base, backgroundColor: muted } : base;
  }, [composedStyle, disabled, muted, primary, secondary, variant]);

  const innerStyle = useMemo(() => {
    let color: ColorValue = "";
    const effectiveVariant: ButtonVariant | undefined = disabled
      ? "muted"
      : variant;

    switch (effectiveVariant) {
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
  }, [composedStyle, disabled, fg, fgMuted, fgPrimary, fgSecondary, variant]);

  return { innerStyle, outerStyle };
}
