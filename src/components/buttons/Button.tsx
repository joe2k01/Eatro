import { StyledViewProps } from "@constants/theme";
import { useComposedStyle } from "@hooks/useComposedStyle";
import { Pressable, PressableProps, StyleSheet } from "react-native";
import type { ViewStyle } from "react-native";
import { ButtonVariant, useButtonStyle } from "./hooks/useButtonStyle";
import { Text } from "@components/typography/Text";
import { ReactNode } from "react";
import { intoThemeDimension } from "@hooks/useThemeDimension";

type LocalButtonProps = { variant?: ButtonVariant; children?: ReactNode };

export type ButtonProps = StyledViewProps<
  Omit<PressableProps, "children"> & ViewStyle & LocalButtonProps
>;

const style = StyleSheet.create({
  button: {
    paddingBlock: intoThemeDimension(2),
    alignItems: "center",
    borderRadius: intoThemeDimension(0.5),
  },
});

export function Button({
  children,
  variant = "primary",
  ...props
}: ButtonProps) {
  const composedStyle = useComposedStyle<ViewStyle>({
    base: style.button,
    props,
  });

  const { outerStyle, innerStyle } = useButtonStyle({ variant, composedStyle });

  return (
    <Pressable {...props} style={outerStyle}>
      <Text style={innerStyle}>{children}</Text>
    </Pressable>
  );
}
