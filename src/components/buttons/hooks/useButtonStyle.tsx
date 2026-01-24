import { useTheme } from "@contexts/ThemeProvider";
import { useMemo } from "react";
import { TextStyle, ViewStyle } from "react-native";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "destructive"
  | "ghost";

export type InvertibleVariant = Exclude<ButtonVariant, "ghost">;

/** @deprecated Use ButtonVariant instead */
export type LegacyButtonVariant =
  | "muted"
  | "transparent"
  | "primaryTranslucent"
  | "secondaryTranslucent"
  | "destructiveTranslucent";

// Legacy variant mapping for backward compatibility
const LEGACY_VARIANT_MAP: Record<LegacyButtonVariant, ButtonVariant> = {
  muted: "tertiary",
  transparent: "ghost",
  primaryTranslucent: "primary",
  secondaryTranslucent: "secondary",
  destructiveTranslucent: "destructive",
};

type GhostButtonStyleProps = {
  variant: "ghost" | "transparent";
  disabled?: boolean | null;
};

type StandardButtonStyleProps = {
  variant?: InvertibleVariant | Exclude<LegacyButtonVariant, "transparent">;
  /** Inverts the button: transparent background with colored border/text. */
  inverted?: boolean;
  disabled?: boolean | null;
};

type UseButtonStyleProps = GhostButtonStyleProps | StandardButtonStyleProps;

type ButtonStyles = {
  containerStyle: ViewStyle;
  textStyle: TextStyle;
};

export function useButtonStyle(props: UseButtonStyleProps): ButtonStyles {
  const theme = useTheme();

  const variant = props.variant ?? "primary";
  const inverted = "inverted" in props ? props.inverted : false;
  const disabled = props.disabled;

  return useMemo(() => {
    // Map legacy variants to new ones
    const resolvedVariant =
      (LEGACY_VARIANT_MAP as Record<string, ButtonVariant>)[variant] ??
      (variant as ButtonVariant);

    // Ghost cannot be inverted (enforced by types, but double-check at runtime)
    const isInverted = inverted && resolvedVariant !== "ghost";

    let backgroundColor: string;
    let highlightColor: string;
    let textColor: string;

    switch (resolvedVariant) {
      case "primary":
        highlightColor = theme.semantic.primary;
        backgroundColor = theme.semantic.primary;
        textColor = theme.text.inverse;
        break;
      case "secondary":
        highlightColor = theme.text.primary;
        backgroundColor = theme.surface.secondary;
        textColor = theme.text.primary;
        break;
      case "tertiary":
        highlightColor = theme.text.secondary;
        backgroundColor = theme.surface.tertiary;
        textColor = theme.text.secondary;
        break;
      case "destructive":
        highlightColor = theme.semantic.destructive;
        backgroundColor = theme.semantic.destructive;
        textColor = theme.text.inverse;
        break;
      case "ghost":
        highlightColor = theme.text.primary;
        backgroundColor = "transparent";
        textColor = theme.text.primary;
        break;
      default:
        highlightColor = theme.semantic.primary;
        backgroundColor = theme.semantic.primary;
        textColor = theme.text.inverse;
    }

    const containerStyle: ViewStyle = isInverted
      ? {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: highlightColor,
          opacity: disabled ? 0.5 : 1,
        }
      : {
          backgroundColor,
          opacity: disabled ? 0.5 : 1,
        };

    const textStyle: TextStyle = {
      color: isInverted ? highlightColor : textColor,
    };

    return { containerStyle, textStyle };
  }, [variant, inverted, disabled, theme]);
}

// Legacy export for backward compatibility
export { useButtonStyle as default };
