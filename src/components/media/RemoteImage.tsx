import { Image, ImageProps, ImageStyle } from "expo-image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { BorderRadius } from "@constants/theme";
import { useTheme } from "@contexts/ThemeProvider";

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
  patternDot: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
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

export function RemoteImage({
  shape,
  style,
  source,
  onError,
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

  const handleError = useCallback(
    (event: Parameters<NonNullable<ImageProps["onError"]>>[0]) => {
      setHasError(true);
      onError?.(event);
    },
    [onError],
  );

  const showFallback = !canRenderSource || hasError;

  return (
    <View style={[composedStyle, styles.container]}>
      {showFallback && (
        <View style={styles.fill}>
          <View
            style={[styles.fill, { backgroundColor: theme.surface.tertiary }]}
          />
          <View
            style={[
              styles.patternDot,
              {
                top: "20%",
                left: "24%",
                backgroundColor: theme.surface.secondary,
                opacity: 0.5,
              },
            ]}
          />
          <View
            style={[
              styles.patternDot,
              {
                top: "52%",
                left: "46%",
                backgroundColor: theme.surface.secondary,
                opacity: 0.45,
              },
            ]}
          />
          <View
            style={[
              styles.patternDot,
              {
                top: "34%",
                left: "68%",
                backgroundColor: theme.surface.secondary,
                opacity: 0.35,
              },
            ]}
          />
          <View
            style={[
              styles.patternDot,
              {
                top: "70%",
                left: "30%",
                backgroundColor: theme.surface.secondary,
                opacity: 0.3,
              },
            ]}
          />
        </View>
      )}
      {canRenderSource && !hasError && (
        <Image
          {...imageProps}
          source={source}
          onError={handleError}
          style={styles.fill}
        />
      )}
    </View>
  );
}
