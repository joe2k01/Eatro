import { StyledViewProps } from "@constants/theme";
import { useComposedStyle } from "@hooks/useComposedStyle";
import { Pressable, PressableProps, StyleSheet, View } from "react-native";
import type { TextStyle, ViewStyle } from "react-native";
import { ButtonVariant, useButtonStyle } from "./hooks/useButtonStyle";
import { TextBody, TextCaption } from "@components/typography/Text";
import { ReactNode, useMemo } from "react";
import { intoThemeDimension } from "@hooks/useThemeDimension";
import { useExtractViewStyleProps } from "@hooks/useExtractViewStyleProps";
import { VStack } from "@components/layout/VStack";

type ButtonTextAlign = Extract<
  TextStyle["textAlign"],
  "left" | "center" | "right"
>;

type LocalButtonProps = {
  variant?: ButtonVariant;
  children?: ReactNode;
  secondaryText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  textAlign?: ButtonTextAlign;
  style?: ViewStyle;
};

export type ButtonProps = StyledViewProps<
  Omit<PressableProps, "children" | "style"> & ViewStyle & LocalButtonProps
>;

const style = StyleSheet.create({
  button: {
    padding: intoThemeDimension(2),
    alignItems: "center",
    borderRadius: intoThemeDimension(0.5),
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    gap: intoThemeDimension(1),
  },
  pressed: {
    opacity: 0.9,
  },
  iconLeft: {
    // paddingRight: intoThemeDimension(1),
  },
  iconRight: {
    // paddingLeft: intoThemeDimension(1),
  },
  secondaryText: {
    opacity: 0.72,
    marginTop: 2,
  },
});

export function Button(props: ButtonProps) {
  const { passthroughProps, styleProps } = useExtractViewStyleProps(props);

  const {
    variant = "primary",
    disabled = false,
    children,
    secondaryText,
    leftIcon,
    rightIcon,
  } = passthroughProps;

  const composedStyle = useComposedStyle<ViewStyle>({
    base: style.button,
    props: styleProps,
  });

  const { outerStyle, innerStyle } = useButtonStyle({
    variant,
    composedStyle,
    disabled,
  });

  const baseOuterStyle = useMemo(
    () => StyleSheet.compose(style.row, outerStyle),
    [outerStyle],
  );
  const pressedOuterStyle = useMemo(
    () =>
      disabled
        ? baseOuterStyle
        : StyleSheet.compose(baseOuterStyle, style.pressed),
    [baseOuterStyle, disabled],
  );

  return (
    <Pressable
      {...passthroughProps}
      disabled={disabled}
      style={({ pressed }) => (pressed ? pressedOuterStyle : baseOuterStyle)}
    >
      {leftIcon && <View style={style.iconLeft}>{leftIcon}</View>}

      <VStack backgroundColor="transparent" gap={0.5}>
        <TextBody style={innerStyle}>{children}</TextBody>
        {secondaryText && (
          <TextCaption style={[style.secondaryText, innerStyle]}>
            {secondaryText}
          </TextCaption>
        )}
      </VStack>

      {rightIcon && <View style={style.iconRight}>{rightIcon}</View>}
    </Pressable>
  );
}
