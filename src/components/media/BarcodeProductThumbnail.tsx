import { memo, useMemo } from "react";
import type { ImageStyle } from "expo-image";
import { useOpenFoodFactsFrontImage } from "@api/hooks/useOpenFoodFactsFrontImage";
import {
  RemoteImage,
  type RemoteImageProps,
} from "@components/media/RemoteImage";

export type BarcodeProductThumbnailProps = {
  barcode: string | null | undefined;
  style?: ImageStyle;
  shape?: RemoteImageProps["shape"];
};

export const BarcodeProductThumbnail = memo(function BarcodeProductThumbnail({
  barcode,
  style,
  shape = "squircle",
}: BarcodeProductThumbnailProps) {
  const { data, isError } = useOpenFoodFactsFrontImage(barcode);

  const source = useMemo(() => {
    if (isError || !data?.imageUrl) return undefined;
    return { uri: data.imageUrl } as const;
  }, [data?.imageUrl, isError]);

  return <RemoteImage source={source} shape={shape} style={style} />;
});
