import { IconSize, IconSizes, StyledViewProps } from "@constants/theme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useComposedStyle } from "@hooks/useComposedStyle";
import { intoThemeDimension } from "@hooks/useThemeDimension";
import { ComponentProps, useMemo } from "react";
import { Pressable, PressableProps, StyleSheet, ViewStyle } from "react-native";
import { ButtonVariant, useButtonStyle } from "./hooks/useButtonStyle";
import { useExtractViewStyleProps } from "@hooks/useExtractViewStyleProps";

type MaterialIconsProps = ComponentProps<typeof MaterialIcons>;

export type IconButtonProps = StyledViewProps<
  {
    size?: IconSize;
    variant?: ButtonVariant;
  } & Pick<MaterialIconsProps, "name"> &
    ViewStyle &
    PressableProps
>;

const style = StyleSheet.create({
  iconButton: {
    borderRadius: 999,
    padding: intoThemeDimension(1),
  },
  pressed: {
    opacity: 0.9,
  },
});

export function IconButton(props: IconButtonProps) {
  const { passthroughProps, styleProps } = useExtractViewStyleProps(props);

  const {
    size = "m",
    name,
    variant = "muted",
    disabled = false,
  } = passthroughProps;

  const composedStyle = useComposedStyle<ViewStyle>({
    base: style.iconButton,
    props: styleProps,
  });

  const { outerStyle, innerStyle } = useButtonStyle({
    variant,
    composedStyle,
    disabled,
  });

  const pressedOuterStyle = useMemo(
    () =>
      disabled ? outerStyle : StyleSheet.compose(outerStyle, style.pressed),
    [disabled, outerStyle],
  );

  return (
    <Pressable
      {...passthroughProps}
      disabled={disabled}
      style={({ pressed }) => (pressed ? pressedOuterStyle : outerStyle)}
    >
      <MaterialIcons
        name={name}
        size={IconSizes[size]}
        color={innerStyle.color}
      />
    </Pressable>
  );
}
