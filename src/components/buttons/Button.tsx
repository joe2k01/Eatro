import { spacing, BorderRadius } from "@constants/theme";
import {
  Pressable,
  PressableProps,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { InvertibleVariant, useButtonStyle } from "./hooks/useButtonStyle";
import { Body, Caption } from "@components/typography/Text";
import { ReactNode, useMemo } from "react";

type BaseButtonProps = Omit<PressableProps, "children" | "style"> & {
  children?: ReactNode;
  /** Secondary text displayed below main text */
  secondaryText?: string;
  /** Icon displayed on the left */
  leftIcon?: ReactNode;
  /** Icon displayed on the right */
  rightIcon?: ReactNode;
  /** Additional styles for the button container */
  style?: ViewStyle;
};

type GhostButtonProps = BaseButtonProps & {
  variant: "ghost";
};

type StandardButtonProps = BaseButtonProps & {
  variant?: InvertibleVariant;
  /** Inverts the button: transparent background with colored border/text */
  inverted?: boolean;
};

export type ButtonProps = GhostButtonProps | StandardButtonProps;

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing(1.5),
    paddingHorizontal: spacing(2),
    borderRadius: BorderRadius.md,
    gap: spacing(1),
  },
  pressed: {
    opacity: 0.8,
  },
  textContainer: {
    alignItems: "center",
  },
  secondaryText: {
    opacity: 0.72,
    marginTop: spacing(0.25),
  },
});

export function Button(props: ButtonProps) {
  const {
    children,
    secondaryText,
    leftIcon,
    rightIcon,
    disabled = false,
    style,
    ...pressableProps
  } = props;

  const variant = props.variant ?? "primary";
  const inverted = "inverted" in props ? props.inverted : false;

  const { containerStyle, textStyle } = useButtonStyle(
    variant === "ghost"
      ? { variant, disabled }
      : { variant, inverted, disabled },
  );

  const baseStyle = useMemo(
    () => StyleSheet.flatten([styles.button, containerStyle, style]),
    [containerStyle, style],
  );

  const pressedStyle = useMemo(
    () =>
      disabled ? baseStyle : StyleSheet.flatten([baseStyle, styles.pressed]),
    [baseStyle, disabled],
  );

  return (
    <Pressable
      {...pressableProps}
      disabled={disabled}
      style={({ pressed }) => (pressed ? pressedStyle : baseStyle)}
    >
      {leftIcon && <View>{leftIcon}</View>}

      <View style={styles.textContainer}>
        <Body style={textStyle}>{children}</Body>
        {secondaryText && (
          <Caption style={[styles.secondaryText, textStyle]}>
            {secondaryText}
          </Caption>
        )}
      </View>

      {rightIcon && <View>{rightIcon}</View>}
    </Pressable>
  );
}
