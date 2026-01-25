import { useEffect, useMemo, useState } from "react";
import Svg, { Circle } from "react-native-svg";
import { UseDonutResult, clampNonNegative } from "./useDonut";
import { Box, BoxProps } from "@components/layout/Box";
import { useTheme } from "@contexts/ThemeProvider";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export type DonutChartProps = {
  strokeWidth?: number;
  /**
   * Denominator used to compute arc fractions. If omitted, the chart uses the
   * sum of segment values (i.e. arcs fill the whole ring).
   *
   * Tip: pass `useDonut(...).total` to show a "remainder" as the track.
   */
  total?: number;
  donutData: UseDonutResult;
  width?: BoxProps["width"];
  /** Track/Background ring colour (not animated). Defaults to theme `surface.tertiary`. */
  trackColor?: string;
};

const DonutGeometry = {
  radius: 50,
  gapDegrees: 2,
  minimumVisibleLength: 0.1,
} as const;

const DonutAnimation = {
  debounceMs: 250,
  durationMs: 650,
} as const;

function computeDonutGeometry(strokeWidth: number) {
  const circumference = 2 * Math.PI * DonutGeometry.radius;
  const gapLength = (circumference * DonutGeometry.gapDegrees) / 360;
  const totalGap = gapLength + strokeWidth;

  const halfStrokeWidth = strokeWidth / 2;
  const viewboxSide = (DonutGeometry.radius + halfStrokeWidth) * 2;

  return {
    circumference,
    totalGap,
    viewBox: `-${halfStrokeWidth} -${halfStrokeWidth} ${viewboxSide} ${viewboxSide}`,
  };
}

type Arc = {
  key: string;
  color: string;
  visibleLength: number;
  dashoffset: number;
};

type DonutArcProps = {
  arc: Arc;
  strokeWidth: number;
  circumference: number;
};

function DonutArc({ arc, strokeWidth, circumference }: DonutArcProps) {
  // Start new arcs from 0 length so they "grow in" instead of popping in.
  // Existing arcs keep their previous shared values and will morph smoothly.
  const visibleLength = useSharedValue(0);
  const dashoffset = useSharedValue(arc.dashoffset);

  useEffect(() => {
    visibleLength.value = withTiming(arc.visibleLength, {
      duration: DonutAnimation.durationMs,
      easing: Easing.out(Easing.cubic),
    });
    dashoffset.value = withTiming(arc.dashoffset, {
      duration: DonutAnimation.durationMs,
      easing: Easing.out(Easing.cubic),
    });
  }, [arc.dashoffset, arc.visibleLength, dashoffset, visibleLength]);

  const animatedProps = useAnimatedProps(() => {
    return {
      strokeDasharray: [visibleLength.value, circumference],
      strokeDashoffset: dashoffset.value,
    };
  });

  return (
    <AnimatedCircle
      cx={DonutGeometry.radius}
      cy={DonutGeometry.radius}
      r={DonutGeometry.radius}
      stroke={arc.color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      fill="transparent"
      animatedProps={animatedProps}
    />
  );
}

export function DonutChart({
  strokeWidth = 18,
  total: propTotal,
  donutData: { segments: propSegments, sum: propSum },
  width = "100%",
  trackColor,
}: DonutChartProps) {
  const theme = useTheme();
  const mTrackColor = trackColor ?? theme.surface.tertiary;

  const mSegments = useMemo(() => {
    return propSegments.filter((s) => s.value > 0);
  }, [propSegments]);

  const { circumference, totalGap, viewBox } = useMemo(
    () => computeDonutGeometry(strokeWidth),
    [strokeWidth],
  );

  // Debounced render state:
  // We keep showing the previous arcs while the user is typing, and only swap
  // to the new arcs once changes have settled.
  const [{ segments, sum, total }, setRenderSnapshot] = useState(() => {
    return { segments: mSegments, sum: propSum, total: propTotal };
  });

  const renderDenom = useMemo(() => {
    const safeTotal = clampNonNegative(total ?? 0);
    // Ensure we never under-shoot the sum, otherwise arcs could overlap.
    return Math.max(safeTotal, sum, 1);
  }, [sum, total]);

  useEffect(() => {
    // Debounce: only update the rendered arcs after input settles.
    const timer = setTimeout(() => {
      setRenderSnapshot({
        segments: mSegments,
        sum: propSum,
        total: propTotal,
      });
    }, DonutAnimation.debounceMs);

    return () => clearTimeout(timer);
  }, [mSegments, propSum, propTotal]);

  const arcs = useMemo(() => {
    if (!segments.length) {
      return [];
    }

    const isSingleSegmentFullRing =
      segments.length === 1 && segments[0].value / renderDenom >= 1;

    // We want tiny segments to show as a "dot" rather than overlapping or
    // disappearing. To achieve that we reserve a minimum display length per
    // non-zero segment and take the remaining space proportionally.
    //
    // NOTE: This is a visual mapping (not a strictly proportional one) for
    // extreme ratios (e.g. 999999 / 1 / 1), to keep the chart readable.
    const count = segments.length;
    const effectiveGap = isSingleSegmentFullRing ? 0 : totalGap;

    // Work in "length space" (circumference units).
    const totalLengthRaw = (circumference * sum) / renderDenom;

    // If totalLengthRaw is very small (e.g. total is huge vs sum), tiny segments
    // can overlap due to round caps. In that case, we intentionally scale up the
    // total length so each segment can render as a readable "dot" + gap.
    const minFullLengthIdeal =
      effectiveGap + DonutGeometry.minimumVisibleLength;
    const minTotalNeeded = minFullLengthIdeal * count;

    const totalLengthToDistribute = Math.min(
      circumference,
      Math.max(totalLengthRaw, minTotalNeeded),
    );

    // If we had to clamp to circumference, we may not be able to afford the
    // ideal minimum. Clamp it down to what we can afford per segment.
    const minFullLength = Math.min(
      minFullLengthIdeal,
      totalLengthToDistribute / count,
    );
    const remainingLength = Math.max(
      0,
      totalLengthToDistribute - minFullLength * count,
    );

    let start = 0;

    return segments.map((s) => {
      const weight = sum > 0 ? s.value / sum : 0;
      const fullLength = minFullLength + remainingLength * weight;

      const perSegmentGap = Math.min(effectiveGap, fullLength);
      const minVisible = Math.min(
        DonutGeometry.minimumVisibleLength,
        fullLength,
      );
      const visibleLength = Math.max(minVisible, fullLength - perSegmentGap);

      const startOffset = start + perSegmentGap / 2;
      start += fullLength;

      return {
        key: s.key,
        color: s.color,
        visibleLength,
        dashoffset: -startOffset,
      };
    });
  }, [circumference, renderDenom, segments, sum, totalGap]);

  return (
    <Box width={width} aspectRatio={1} backgroundColor="transparent">
      <Svg width={"100%"} height={"100%"} viewBox={viewBox}>
        <Circle
          cx={DonutGeometry.radius}
          cy={DonutGeometry.radius}
          r={DonutGeometry.radius}
          stroke={mTrackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {arcs.map((arc) => (
          <DonutArc
            key={arc.key}
            arc={arc}
            strokeWidth={strokeWidth}
            circumference={circumference}
          />
        ))}
      </Svg>
    </Box>
  );
}
