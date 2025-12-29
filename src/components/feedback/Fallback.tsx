import { StyledViewProps } from "@constants/theme";
import { useTheme } from "@contexts/ThemeProvider";
import { useComposedStyle } from "@hooks/useComposedStyle";
import { useExtractViewStyleProps } from "@hooks/useExtractViewStyleProps";
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

export type FallbackShape = "rect" | "squircle" | "circle";

export type FallbackProps = StyledViewProps<
  ViewProps &
    ViewStyle & {
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
    }
>;

const AnimatedRect = Animated.createAnimatedComponent(Rect);

/**
 * Animated skeleton placeholder with a shimmer gradient (Netflix/LinkedIn style).
 *
 * - Uses SVG for the gradient, Reanimated for smooth native-driven animation.
 * - Respects your existing `StyledViewProps` system (dimensions + theme colors).
 */
export function Fallback(props: FallbackProps) {
  const theme = useTheme();
  const { passthroughProps, styleProps } = useExtractViewStyleProps(props);

  const {
    shape = "rect",
    borderRadius: borderRadiusOverride,
    animate = true,
    durationMs = 1200,
    baseColor,
    highlightColor,
  } = passthroughProps;

  const composedStyle = useComposedStyle<ViewStyle>({
    base: styles.base,
    props: styleProps,
  });

  const background = baseColor ?? theme.card;
  const highlight = highlightColor ?? theme.popover;

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
    // Wider on large surfaces, still reasonable on small text fallbacks.
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
    if (shape === "squircle") return 12;
    return 8;
  }, [borderRadiusOverride, shape, size.h, size.w]);

  const showSvg = size.w > 0 && size.h > 0;

  return (
    <View
      {...passthroughProps}
      onLayout={onLayout}
      style={[
        composedStyle,
        { backgroundColor: background, borderRadius: radius },
      ]}
    >
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
