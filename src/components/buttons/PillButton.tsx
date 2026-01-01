import { Box } from "@components/layout/Box";
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { intoThemeDimension } from "@hooks/useThemeDimension";
import { ButtonVariant, useButtonStyle } from "./hooks/useButtonStyle";
import { HStack } from "@components/layout/HStack";
import { TextBody } from "@components/typography/Text";
import { useCallback, useEffect, useMemo, useState } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export type PillButtonProps<T> = {
  options: { label: string; value: T }[];
  selected: string | T;
  onSelect: (value: T) => void;
  variant?: ButtonVariant;
};

const style = StyleSheet.create({
  outerPill: {
    padding: intoThemeDimension(0.5),
    borderRadius: intoThemeDimension(0.5),
    backgroundColor: "muted",
    borderWidth: 1,
  },
  innerRow: {
    position: "relative",
    overflow: "hidden",
    gap: intoThemeDimension(0.5),
  },
  indicator: {
    position: "absolute",
    top: 0,
    left: 0,
    borderRadius: intoThemeDimension(0.5),
  },
  tab: {
    paddingVertical: intoThemeDimension(0.75),
    paddingHorizontal: intoThemeDimension(0.75),
  },
});

const fakeComposedStyle: ViewStyle = {};

type TabLayout = { x: number; width: number; height: number };

const INDICATOR_ANIMATION_MS = 220;

export function PillButton<T>({
  options,
  selected,
  onSelect,
  variant = "primary",
}: PillButtonProps<T>) {
  const { outerStyle, innerStyle } = useButtonStyle({
    variant,
    composedStyle: fakeComposedStyle,
  });

  // Measure tabs so we can animate an indicator behind the selected option.
  const [layouts, setLayouts] = useState<TabLayout[]>([]);

  const onTabLayout = useCallback((e: LayoutChangeEvent, index: number) => {
    const { x, width, height } = e.nativeEvent.layout;

    setLayouts((l) => {
      const newLayouts = [...l];
      newLayouts[index] = { x, width, height };
      return newLayouts;
    });
  }, []);

  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);
  const indicatorHeight = useSharedValue(0);
  const indicatorOpacity = useSharedValue(0);

  useEffect(() => {
    const layoutIndex = options.findIndex((opt) => opt.value === selected);

    const layout = layoutIndex >= 0 ? layouts[layoutIndex] : undefined;

    if (!layout) {
      indicatorOpacity.value = withTiming(0, {
        duration: 120,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      // Native-driven sliding indicator (typical segmented control / tabs UX).
      indicatorOpacity.value = withTiming(1, {
        duration: 120,
        easing: Easing.out(Easing.cubic),
      });
      indicatorX.value = withTiming(layout.x, {
        duration: INDICATOR_ANIMATION_MS,
        easing: Easing.out(Easing.cubic),
      });
      indicatorWidth.value = withTiming(layout.width, {
        duration: INDICATOR_ANIMATION_MS,
        easing: Easing.out(Easing.cubic),
      });
      indicatorHeight.value = withTiming(layout.height, {
        duration: INDICATOR_ANIMATION_MS,
        easing: Easing.out(Easing.cubic),
      });
    }
    // We don't need to track ref and shared values
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, options, layouts]);

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    return {
      opacity: indicatorOpacity.value,
      transform: [{ translateX: indicatorX.value }],
      width: indicatorWidth.value,
      height: indicatorHeight.value,
    };
  });

  const selectedBackgroundColor = useMemo(() => {
    const bg = outerStyle.backgroundColor;
    return typeof bg === "string" ? bg : "transparent";
  }, [outerStyle.backgroundColor]);

  return (
    <Box
      style={style.outerPill}
      borderColor={outerStyle.backgroundColor as string}
    >
      <HStack backgroundColor="transparent" style={style.innerRow}>
        <Animated.View
          pointerEvents="none"
          style={[
            style.indicator,
            { backgroundColor: selectedBackgroundColor },
            animatedIndicatorStyle,
          ]}
        />
        {options.map(({ label, value }, index) => {
          const isSelected = value === selected;
          return (
            <Pressable
              key={label}
              onPress={() => onSelect(value)}
              onLayout={(e) => onTabLayout(e, index)}
              style={style.tab}
            >
              <TextBody
                color={isSelected ? (innerStyle.color as string) : "fgMuted"}
              >
                {label}
              </TextBody>
            </Pressable>
          );
        })}
      </HStack>
    </Box>
  );
}
