import { useComposedStyle } from "@hooks/useComposedStyle";
import { Image, ImageProps, ImageStyle } from "expo-image";
import { useMemo } from "react";
import { StyleSheet } from "react-native";

export type RemoteImageProps = ImageProps &
  ImageStyle & {
    shape?: "squircle";
  };

export function RemoteImage({ shape, ...props }: RemoteImageProps) {
  const { baseStyle } = useMemo(() => {
    let baseStyle: ImageStyle = {};
    switch (shape) {
      case "squircle":
        baseStyle = {
          borderRadius: 10,
        };
        break;
      default:
        break;
    }

    return StyleSheet.create({ baseStyle });
  }, [shape]);

  const composedStyle = useComposedStyle({ props, base: baseStyle });

  return <Image {...props} style={composedStyle} />;
}
