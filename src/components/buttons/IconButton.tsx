import { IconSize, IconSizes, spacing, BorderRadius } from "@constants/theme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ComponentProps, useMemo } from "react";
import { Pressable, PressableProps, StyleSheet, ViewStyle } from "react-native";
import { InvertibleVariant, useButtonStyle } from "./hooks/useButtonStyle";

type MaterialIconsProps = ComponentProps<typeof MaterialIcons>;

type BaseIconButtonProps = Omit<PressableProps, "children" | "style"> &
  Pick<MaterialIconsProps, "name"> & {
    size?: IconSize;
    style?: ViewStyle;
  };

type GhostIconButtonProps = BaseIconButtonProps & {
  variant: "ghost";
};

type StandardIconButtonProps = BaseIconButtonProps & {
  variant?: InvertibleVariant;
  inverted?: boolean;
};

export type IconButtonProps = GhostIconButtonProps | StandardIconButtonProps;

const styles = StyleSheet.create({
  iconButton: {
    borderRadius: BorderRadius.full,
    padding: spacing(1),
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.8,
  },
});

export function IconButton(props: IconButtonProps) {
  const {
    size = "m",
    name,
    disabled = false,
    style,
    ...pressableProps
  } = props;

  const variant = props.variant ?? "tertiary";
  const inverted = "inverted" in props ? props.inverted : false;

  const { containerStyle, textStyle } = useButtonStyle(
    variant === "ghost"
      ? { variant, disabled }
      : { variant, inverted, disabled },
  );

  const baseStyle = useMemo(
    () => StyleSheet.flatten([styles.iconButton, containerStyle, style]),
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
      <MaterialIcons
        name={name}
        size={IconSizes[size]}
        color={textStyle.color}
      />
    </Pressable>
  );
}
