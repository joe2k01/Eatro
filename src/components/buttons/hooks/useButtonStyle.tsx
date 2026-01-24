import { Style } from "@constants/theme";
import { useTheme } from "@contexts/ThemeProvider";
import { useMemo } from "react";
import { ColorValue, StyleProp, StyleSheet } from "react-native";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "destructive"
  | "transparent"
  | "muted"
  | "primaryTranslucent"
  | "secondaryTranslucent"
  | "destructiveTranslucent";

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
  const {
    primary,
    fgPrimary,
    secondary,
    fgSecondary,
    destructive,
    fgDestructive,
    muted,
    fgMuted,
    fg,
  } = useTheme();

  const outerStyle = useMemo(() => {
    let background: string = "transparent";
    const effectiveVariant: ButtonVariant | undefined = variant;

    switch (effectiveVariant) {
      case "primary":
        background = primary;
        break;
      case "secondary":
        background = secondary;
        break;
      case "destructive":
        background = destructive;
        break;
      case "primaryTranslucent":
        background = `${primary}26`; // 15% opacity (26 in hex = ~15%)
        break;
      case "secondaryTranslucent":
        background = `${secondary}26`; // 15% opacity
        break;
      case "destructiveTranslucent":
        background = `${destructive}26`; // 15% opacity
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

    const finalBase = { ...base };

    // If a button is visually "transparent", give disabled state a visible surface.
    if (disabled && finalBase.backgroundColor === "transparent") {
      finalBase.backgroundColor = muted;
    }

    // Make disabled/pressed feedback consistent while allowing callers to
    // override `opacity` if they explicitly set it.
    if (disabled && finalBase.opacity === undefined) {
      finalBase.opacity = 0.72;
    }

    return finalBase;
  }, [
    composedStyle,
    destructive,
    disabled,
    muted,
    primary,
    secondary,
    variant,
  ]);

  const innerStyle = useMemo(() => {
    let color: ColorValue = "";
    const effectiveVariant: ButtonVariant | undefined = variant;

    switch (effectiveVariant) {
      case "primary":
        color = fgPrimary;
        break;
      case "secondary":
        color = fgSecondary;
        break;
      case "destructive":
        color = fgDestructive;
        break;
      case "primaryTranslucent":
        color = primary; // Foreground is the solid primary color
        break;
      case "secondaryTranslucent":
        color = secondary; // Foreground is the solid secondary color
        break;
      case "destructiveTranslucent":
        color = destructive; // Foreground is the solid destructive color
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
  }, [
    composedStyle,
    destructive,
    fgDestructive,
    fg,
    fgMuted,
    fgPrimary,
    fgSecondary,
    primary,
    secondary,
    variant,
  ]);

  return { innerStyle, outerStyle };
}
