import { useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useTheme } from "@contexts/ThemeProvider";
import { Caption, Body } from "@components/typography/Text";
import { spacing, BorderRadius } from "@constants/theme";
import { match } from "ts-pattern";

export enum SnackbarVariant {
  Success,
  Error,
  Info,
}

export type SnackbarProps = {
  message: string;
  variant?: SnackbarVariant;
  visible: boolean;
};

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: spacing(2),
    right: spacing(2),
  },
  card: {
    borderRadius: BorderRadius.lg,
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1.5),
    borderLeftWidth: 4,
  },
});

const ANIMATION_DURATION_MS = 250;

export function Snackbar({ message, variant, visible }: SnackbarProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const translateY = useSharedValue(24);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    const targetTranslate = visible ? 0 : 24;
    const targetOpacity = visible ? 1 : 0;
    const targetScale = visible ? 1 : 0.8;

    if (visible) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    translateY.value = withTiming(targetTranslate, {
      duration: ANIMATION_DURATION_MS,
      easing: Easing.out(Easing.cubic),
    });
    opacity.value = withTiming(targetOpacity, {
      duration: ANIMATION_DURATION_MS,
      easing: Easing.out(Easing.cubic),
    });
    scale.value = withTiming(targetScale, {
      duration: ANIMATION_DURATION_MS,
      easing: Easing.out(Easing.cubic),
    });
  }, [message, opacity, scale, translateY, visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  const indicatorColor = useMemo(
    () =>
      match(variant)
        .with(SnackbarVariant.Success, () => theme.primary)
        .with(SnackbarVariant.Error, () => theme.destructive)
        .otherwise(() => theme.secondary),
    [theme, variant],
  );

  const variantLabel = useMemo(
    () =>
      match(variant)
        .with(SnackbarVariant.Success, () => "Success")
        .with(SnackbarVariant.Error, () => "Error")
        .otherwise(() => "Info"),
    [variant],
  );

  const wrapperPositionStyle = useMemo(
    () =>
      StyleSheet.flatten([
        styles.wrapper,
        { bottom: insets.bottom + spacing(2) },
      ]),
    [insets.bottom],
  );

  if (!message) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[wrapperPositionStyle, animatedStyle]}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.popover,
            borderLeftColor: indicatorColor,
          },
        ]}
      >
        <Caption style={{ color: indicatorColor }}>{variantLabel}</Caption>
        <Body style={{ color: theme.fgPopover }}>{message}</Body>
      </View>
    </Animated.View>
  );
}
