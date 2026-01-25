import { Image, ImageProps, ImageStyle } from "expo-image";
import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { BorderRadius } from "@constants/theme";

export type RemoteImageProps = ImageProps & {
  shape?: "squircle";
  style?: ImageStyle;
};

export function RemoteImage({ shape, style, ...imageProps }: RemoteImageProps) {
  const composedStyle = useMemo(() => {
    const baseStyle: ImageStyle =
      shape === "squircle" ? { borderRadius: BorderRadius.lg } : {};

    return StyleSheet.flatten([baseStyle, style]);
  }, [shape, style]);

  return <Image {...imageProps} style={composedStyle} />;
}
