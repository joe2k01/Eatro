import { useTheme } from "@contexts/ThemeProvider";
import { useEffect, useMemo, useState } from "react";
import {
  LayoutChangeEvent,
  StyleSheet,
  View,
  ViewProps,
  ViewStyle,
} from "react-native";
import Svg, {
  ClipPath,
  Defs,
  LinearGradient,
  Rect,
  Stop,
} from "react-native-svg";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { BorderRadius } from "@constants/theme";

export type FallbackShape = "rect" | "squircle" | "circle";

export type FallbackProps = ViewProps & {
  shape?: FallbackShape;
  /** Override the default corner radius (in px). */
  borderRadius?: number;
  /** Disable shimmer animation (renders static placeholder). */
  animate?: boolean;
  /** Shimmer duration (ms). */
  durationMs?: number;
  /** Override base skeleton color. */
  baseColor?: string;
  /** Override highlight skeleton color. */
  highlightColor?: string;
  style?: ViewStyle;
};

const AnimatedRect = Animated.createAnimatedComponent(Rect);

/**
 * Animated skeleton placeholder with a shimmer gradient (Netflix/LinkedIn style).
 */
export function Fallback({
  shape = "rect",
  borderRadius: borderRadiusOverride,
  animate = true,
  durationMs = 1200,
  baseColor,
  highlightColor,
  style,
  ...viewProps
}: FallbackProps) {
  const theme = useTheme();

  const background = baseColor ?? theme.surface.secondary;
  const highlight = highlightColor ?? theme.surface.tertiary;

  const [size, setSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  const onLayout = useMemo(
    () => (e: LayoutChangeEvent) => {
      const w = Math.ceil(e.nativeEvent.layout.width);
      const h = Math.ceil(e.nativeEvent.layout.height);
      setSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
    },
    [],
  );

  const shimmerX = useSharedValue(0);

  const shimmerWidth = useMemo(() => {
    return Math.max(24, Math.round(size.w * 0.35));
  }, [size.w]);

  useEffect(() => {
    cancelAnimation(shimmerX);
    if (!animate || size.w <= 0 || size.h <= 0) return;

    const start = -shimmerWidth;
    const end = size.w + shimmerWidth;
    shimmerX.value = start;
    shimmerX.value = withRepeat(
      withTiming(end, {
        duration: durationMs,
        easing: Easing.inOut(Easing.linear),
      }),
      -1,
      false,
    );

    return () => cancelAnimation(shimmerX);
  }, [animate, durationMs, shimmerWidth, shimmerX, size.h, size.w]);

  const animatedRectProps = useAnimatedProps(() => {
    return { x: shimmerX.value };
  });

  const radius = useMemo(() => {
    if (typeof borderRadiusOverride === "number") return borderRadiusOverride;
    if (shape === "circle") return Math.min(size.w, size.h) / 2;
    if (shape === "squircle") return BorderRadius.lg;
    return BorderRadius.md;
  }, [borderRadiusOverride, shape, size.h, size.w]);

  const composedStyle = useMemo(
    () =>
      StyleSheet.flatten([
        styles.base,
        { backgroundColor: background, borderRadius: radius },
        style,
      ]),
    [background, radius, style],
  );

  const showSvg = size.w > 0 && size.h > 0;

  return (
    <View {...viewProps} onLayout={onLayout} style={composedStyle}>
      {showSvg && (
        <Svg width={size.w} height={size.h}>
          <Defs>
            <ClipPath id="clip">
              <Rect
                x={0}
                y={0}
                width={size.w}
                height={size.h}
                rx={radius}
                ry={radius}
              />
            </ClipPath>

            <LinearGradient id="shimmer" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={background} stopOpacity={0} />
              <Stop offset="0.5" stopColor={highlight} stopOpacity={0.9} />
              <Stop offset="1" stopColor={background} stopOpacity={0} />
            </LinearGradient>
          </Defs>

          {/* Base fill */}
          <Rect
            x={0}
            y={0}
            width={size.w}
            height={size.h}
            rx={radius}
            ry={radius}
            fill={background}
            clipPath="url(#clip)"
          />

          {/* Moving shimmer band */}
          {animate && (
            <AnimatedRect
              animatedProps={animatedRectProps}
              y={0}
              width={shimmerWidth}
              height={size.h}
              fill="url(#shimmer)"
              clipPath="url(#clip)"
            />
          )}
        </Svg>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: "hidden",
  },
});
