import { ComponentProps } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { IconSize, IconSizes, StyledViewProps } from "@constants/theme";
import { ColorValue, View, ViewProps, ViewStyle } from "react-native";
import {
  ButtonVariant,
  useButtonStyle,
} from "@components/buttons/hooks/useButtonStyle";

type MaterialIconsProps = ComponentProps<typeof MaterialIcons>;
type MaterialCommunityIconsProps = ComponentProps<
  typeof MaterialCommunityIcons
>;

type IsCommunity =
  | ({ community: true } & Pick<MaterialCommunityIconsProps, "name">)
  | ({ community?: false } & Pick<MaterialIconsProps, "name">);

type IconProps = StyledViewProps<
  {
    size?: IconSize;
    variant?: ButtonVariant;
  } & IsCommunity &
    ViewStyle &
    ViewProps
>;

function IconComponent({
  name,
  community,
  size = "m",
  color,
}: IsCommunity & Pick<IconProps, "size"> & { color: ColorValue }) {
  if (community) {
    return (
      <MaterialCommunityIcons
        name={name}
        size={IconSizes[size]}
        color={color}
      />
    );
  }

  return <MaterialIcons name={name} size={IconSizes[size]} color={color} />;
}

export function Icon({ variant, ...props }: IconProps) {
  const { innerStyle } = useButtonStyle({ variant, composedStyle: props });

  return (
    <View {...props}>
      <IconComponent {...props} color={innerStyle.color} />
    </View>
  );
}
