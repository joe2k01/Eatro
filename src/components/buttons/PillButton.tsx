import { spacing, BorderRadius } from "@constants/theme";
import { useTheme } from "@contexts/ThemeProvider";
import { LayoutChangeEvent, Pressable, StyleSheet, View } from "react-native";
import { Body } from "@components/typography/Text";
import { useCallback, useEffect, useMemo, useState } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { InvertibleVariant, useButtonStyle } from "./hooks/useButtonStyle";

export type PillButtonProps<T> = {
  options: { label: string; value: T }[];
  selected: T;
  onSelect: (value: T) => void;
  /** Variant for the selected indicator */
  variant?: InvertibleVariant;
};

const styles = StyleSheet.create({
  outerPill: {
    padding: spacing(0.5),
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  innerRow: {
    flexDirection: "row",
    position: "relative",
    overflow: "hidden",
    gap: spacing(0.5),
  },
  indicator: {
    position: "absolute",
    top: 0,
    left: 0,
    borderRadius: BorderRadius.md,
  },
  tab: {
    paddingVertical: spacing(0.75),
    paddingHorizontal: spacing(1),
  },
});

type TabLayout = { x: number; width: number; height: number };

const INDICATOR_ANIMATION_MS = 220;

export function PillButton<T>({
  options,
  selected,
  onSelect,
  variant = "primary",
}: PillButtonProps<T>) {
  const theme = useTheme();
  const { containerStyle, textStyle } = useButtonStyle({ variant });

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, options, layouts]);

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    opacity: indicatorOpacity.value,
    transform: [{ translateX: indicatorX.value }],
    width: indicatorWidth.value,
    height: indicatorHeight.value,
  }));

  const outerStyle = useMemo(
    () => [
      styles.outerPill,
      {
        backgroundColor: theme.surface.tertiary,
        borderColor: theme.surface.tertiary,
      },
    ],
    [theme],
  );

  return (
    <View style={outerStyle}>
      <View style={styles.innerRow}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.indicator,
            { backgroundColor: containerStyle.backgroundColor },
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
              style={styles.tab}
            >
              <Body
                style={{
                  color: isSelected ? textStyle.color : theme.text.secondary,
                }}
              >
                {label}
              </Body>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
