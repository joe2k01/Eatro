import { StyledViewProps } from "@constants/theme";
import { useComposedStyle } from "@hooks/useComposedStyle";
import { Pressable, PressableProps, StyleSheet, View } from "react-native";
import type { TextStyle, ViewStyle } from "react-native";
import { ButtonVariant, useButtonStyle } from "./hooks/useButtonStyle";
import { TextBody, TextCaption } from "@components/typography/Text";
import { ReactNode } from "react";
import { intoThemeDimension } from "@hooks/useThemeDimension";
import { HStack } from "@components/layout/HStack";
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

export function Button({
  children,
  variant = "primary",
  secondaryText,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}: ButtonProps) {
  const composedStyle = useComposedStyle<ViewStyle>({
    base: style.button,
    props,
  });

  const { outerStyle, innerStyle } = useButtonStyle({
    variant,
    composedStyle,
    disabled,
  });

  return (
    <Pressable {...props} disabled={disabled} style={{ flex: outerStyle.flex }}>
      <HStack
        backgroundColor="transparent"
        alignItems="center"
        gap={1}
        style={outerStyle}
      >
        {leftIcon && <View style={style.iconLeft}>{leftIcon}</View>}

        <VStack backgroundColor="transparent" gap={0.5}>
          <TextBody style={innerStyle}>{children}</TextBody>
          {secondaryText && (
            <TextCaption style={innerStyle}>{secondaryText}</TextCaption>
          )}
        </VStack>

        {rightIcon && <View style={style.iconRight}>{rightIcon}</View>}
      </HStack>
    </Pressable>
  );
}
