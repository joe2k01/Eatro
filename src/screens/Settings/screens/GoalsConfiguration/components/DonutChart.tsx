import { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export type DonutSegment = {
  key: string;
  value: number;
  color: string;
};

export type DonutChartProps = {
  size?: number;
  strokeWidth?: number;
  gapDegrees?: number;
  backgroundColor?: string;
  segments: DonutSegment[];
};

function clampNonNegative(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, n);
}

export function DonutChart({
  size = 200,
  strokeWidth = 18,
  gapDegrees = 6,
  backgroundColor = "transparent",
  segments,
}: DonutChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const cleanedSegments = useMemo(() => {
    const cleaned = segments
      .map((s) => ({ ...s, value: clampNonNegative(s.value) }))
      .filter((s) => s.value > 0);

    const total = cleaned.reduce((acc, s) => acc + s.value, 0);

    return { cleaned, total };
  }, [segments]);

  const gapLength = (circumference * gapDegrees) / 360;

  const progress = useRef<Animated.Value[]>(
    Array.from({ length: segments.length }, () => new Animated.Value(0)),
  ).current;

  const dataSignature = useMemo(() => {
    return segments
      .map((s) => `${s.key}:${clampNonNegative(s.value)}`)
      .join("|");
  }, [segments]);

  useEffect(() => {
    // Re-run a simple "draw in" animation whenever the data changes.
    progress.forEach((p) => p.setValue(0));

    Animated.parallel(
      progress.map((p) =>
        Animated.timing(p, {
          toValue: 1,
          duration: 650,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
      ),
    ).start();
  }, [cleanedSegments.total, dataSignature, progress]);

  const arcs = useMemo(() => {
    const { cleaned, total } = cleanedSegments;

    if (!total) {
      return [];
    }

    let start = 0;

    return cleaned.map((s, idx) => {
      const fraction = s.value / total;
      const fullLength = circumference * fraction;
      const visibleLength = Math.max(0, fullLength - gapLength);

      const startOffset = start + gapLength / 2;
      start += fullLength;

      const dasharray = progress[idx].interpolate({
        inputRange: [0, 1],
        outputRange: [
          `0 ${circumference}`,
          `${visibleLength} ${circumference}`,
        ],
      });

      return {
        key: s.key,
        color: s.color,
        dasharray,
        dashoffset: -startOffset,
      };
    });
  }, [circumference, gapLength, cleanedSegments, progress]);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <G rotation={-90} originX={size / 2} originY={size / 2}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {arcs.map((arc) => (
            <AnimatedCircle
              key={arc.key}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={arc.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              fill="transparent"
              strokeDasharray={arc.dasharray as unknown as string}
              strokeDashoffset={arc.dashoffset}
            />
          ))}
        </G>
      </Svg>
    </View>
  );
}


