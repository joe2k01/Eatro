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

type GhostButtonStyleProps = {
  variant: "ghost";
  disabled?: boolean | null;
};

type StandardButtonStyleProps = {
  variant?: InvertibleVariant;
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
    // Ghost cannot be inverted (enforced by types, but double-check at runtime)
    const isInverted = inverted && variant !== "ghost";

    let backgroundColor: string;
    let highlightColor: string;
    let textColor: string;

    switch (variant) {
      case "primary":
        highlightColor = theme.semantic.primary;
        backgroundColor = theme.semantic.primary;
        textColor = theme.text.inverse;
        break;
      case "secondary":
        highlightColor = theme.semantic.secondary;
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
