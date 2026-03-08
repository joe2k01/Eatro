import { Image, ImageProps, ImageStyle } from "expo-image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
import { BorderRadius } from "@constants/theme";
import { useTheme } from "@contexts/ThemeProvider";
import type { ThemeColors } from "@constants/theme";

export type RemoteImageProps = ImageProps & {
  shape?: "squircle";
  style?: ImageStyle;
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  fill: {
    ...StyleSheet.absoluteFillObject,
  },
});

function hasUsableSource(source: ImageProps["source"]): boolean {
  if (!source) return false;
  if (typeof source === "string") return source.trim().length > 0;
  if (typeof source === "object" && "uri" in source) {
    return Boolean(source.uri);
  }
  return false;
}

const BLOB_PATH =
  "M -22,8 C -28,-16 -2,-36 22,-26 C 46,-16 32,10 44,22 C 56,34 48,60 20,58 C -8,56 -16,32 -22,8 Z";

function FallbackArtwork({ theme }: { theme: ThemeColors }) {
  return (
    <View style={styles.fill}>
      <Svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <Rect width="100" height="100" fill={theme.surface.secondary} />
        <Path
          d={BLOB_PATH}
          fill={theme.semantic.primary}
          opacity={0.16}
          transform="translate(50,50) rotate(-25)"
        />
        <Path
          d={BLOB_PATH}
          fill={theme.semantic.accent}
          opacity={0.2}
          transform="translate(50,50) rotate(155)"
        />
      </Svg>
    </View>
  );
}

type ResolvedImageProps = {
  source: ImageProps["source"];
  canRenderSource: boolean;
  hasError: boolean;
  onLoadError: () => void;
} & Omit<ImageProps, "source" | "onError">;

function ResolvedImage({
  source,
  canRenderSource,
  hasError,
  onLoadError,
  ...imageProps
}: ResolvedImageProps) {
  if (!canRenderSource || hasError) return null;

  return (
    <Image
      {...imageProps}
      source={source}
      onError={onLoadError}
      style={styles.fill}
    />
  );
}

export function RemoteImage({
  shape,
  style,
  source,
  ...imageProps
}: RemoteImageProps) {
  const theme = useTheme();
  const [hasError, setHasError] = useState(false);

  const composedStyle = useMemo(() => {
    const baseStyle: ImageStyle =
      shape === "squircle" ? { borderRadius: BorderRadius.lg } : {};

    return StyleSheet.flatten([baseStyle, style]);
  }, [shape, style]);

  const canRenderSource = useMemo(() => hasUsableSource(source), [source]);

  useEffect(() => {
    setHasError(false);
  }, [source]);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  const showFallback = !canRenderSource || hasError;

  return (
    <View style={[composedStyle, styles.container]}>
      {showFallback && <FallbackArtwork theme={theme} />}
      <ResolvedImage
        {...imageProps}
        source={source}
        canRenderSource={canRenderSource}
        hasError={hasError}
        onLoadError={handleError}
      />
    </View>
  );
}
