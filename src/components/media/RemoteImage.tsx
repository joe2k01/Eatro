import { useComposedStyle } from "@hooks/useComposedStyle";
import { Image, ImageProps, ImageStyle } from "expo-image";

export type RemoteImageProps = ImageProps & ImageStyle;

export function RemoteImage(props: RemoteImageProps) {
  const composedStyle = useComposedStyle({ props });

  return <Image {...props} style={composedStyle} />;
}
