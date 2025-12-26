import { ComponentProps } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { IconSize, IconSizes, StyledViewProps } from "@constants/theme";
import { View, ViewProps, ViewStyle } from "react-native";
import {
  ButtonVariant,
  useButtonStyle,
} from "@components/buttons/hooks/useButtonStyle";

type MaterialIconsProps = ComponentProps<typeof MaterialIcons>;

type IconProps = StyledViewProps<
  {
    size?: IconSize;
    variant?: ButtonVariant;
  } & Pick<MaterialIconsProps, "name"> &
    ViewStyle &
    ViewProps
>;

export function Icon({ size = "m", name, variant, ...props }: IconProps) {
  const { innerStyle } = useButtonStyle({ variant, composedStyle: props });
  return (
    <View {...props}>
      <MaterialIcons
        name={name}
        size={IconSizes[size]}
        color={innerStyle.color}
      />
    </View>
  );
}
