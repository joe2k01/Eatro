import { useComposedStyle } from "@hooks/useComposedStyle";
import { Image, ImageProps, ImageStyle } from "expo-image";
import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { useExtractViewStyleProps } from "@hooks/useExtractViewStyleProps";
import { StyledViewProps } from "@constants/theme";

export type RemoteImageProps = StyledViewProps<
  ImageProps &
    ImageStyle & {
      shape?: "squircle";
    }
>;

export function RemoteImage(props: RemoteImageProps) {
  const { passthroughProps, styleProps } =
    useExtractViewStyleProps<RemoteImageProps>(props);

  const { shape } = passthroughProps;

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

  const composedStyle = useComposedStyle({
    props: styleProps,
    base: baseStyle,
  }) as ImageStyle;

  return <Image {...passthroughProps} style={composedStyle} />;
}
