import { IconSize, IconSizes } from "@constants/theme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useComposedStyle } from "@hooks/useComposedStyle";
import { intoThemeDimension } from "@hooks/useThemeDimension";
import { ComponentProps } from "react";
import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { ButtonVariant, useButtonStyle } from "./hooks/useButtonStyle";

type MaterialIconsProps = ComponentProps<typeof MaterialIcons>;

type IconButtonProps = Omit<PressableProps, "style"> & {
  size?: IconSize;
  style?: StyleProp<ViewStyle>;
  variant?: ButtonVariant;
} & Pick<MaterialIconsProps, "name"> &
  ViewStyle;

const style = StyleSheet.create({
  iconButton: {
    borderRadius: 999,
    padding: intoThemeDimension(1),
  },
});

export function IconButton({
  size = "m",
  name,
  variant,
  disabled,
  ...props
}: IconButtonProps) {
  const composedStyle = useComposedStyle<ViewStyle>({
    base: style.iconButton,
    props,
  });

  const { outerStyle, innerStyle } = useButtonStyle({
    variant,
    composedStyle,
    disabled,
  });

  return (
    <Pressable {...props} style={outerStyle} disabled={disabled}>
      <MaterialIcons
        name={name}
        size={IconSizes[size]}
        color={innerStyle.color}
      />
    </Pressable>
  );
}
