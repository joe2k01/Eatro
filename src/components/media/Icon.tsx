import { ComponentProps, useMemo } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { IconSize, IconSizes } from "@constants/theme";
import { ColorValue, View, ViewProps, ViewStyle } from "react-native";
import {
  InvertibleVariant,
  useButtonStyle,
} from "@components/buttons/hooks/useButtonStyle";
import { useTheme } from "@contexts/ThemeProvider";

type MaterialIconsProps = ComponentProps<typeof MaterialIcons>;
type MaterialCommunityIconsProps = ComponentProps<
  typeof MaterialCommunityIcons
>;

type IsCommunity =
  | ({ community: true } & Pick<MaterialCommunityIconsProps, "name">)
  | ({ community?: false } & Pick<MaterialIconsProps, "name">);

export type IconProps = ViewProps &
  IsCommunity & {
    size?: IconSize;
    /** Use variant to get color from button style system */
    variant?: InvertibleVariant;
    /** When true, uses the inverted color for the variant */
    inverted?: boolean;
    /** Direct color override */
    color?: ColorValue;
    style?: ViewStyle;
  };

function IconComponent({
  name,
  community,
  size = "m",
  color,
}: IsCommunity & { size?: IconSize; color: ColorValue }) {
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

export function Icon({
  variant = "tertiary",
  inverted,
  color: colorProp,
  size,
  name,
  community,
  ...viewProps
}: IconProps) {
  const theme = useTheme();
  const { textStyle } = useButtonStyle({ variant, inverted });

  // Determine color: prop > variant > default
  const iconColor = useMemo<ColorValue>(
    () => colorProp ?? textStyle.color ?? theme.text.primary,
    [colorProp, textStyle.color, theme.text.primary],
  );

  // Type narrowing for community prop
  const iconProps = useMemo(
    () =>
      community
        ? {
            community: true as const,
            name: name as MaterialCommunityIconsProps["name"],
          }
        : {
            community: false as const,
            name: name as MaterialIconsProps["name"],
          },
    [community, name],
  );

  return (
    <View {...viewProps}>
      <IconComponent {...iconProps} size={size} color={iconColor} />
    </View>
  );
}
