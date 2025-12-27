import { useEffect, useMemo } from "react";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useTheme } from "@contexts/ThemeProvider";
import { Box } from "@components/layout/Box";
import { TextCaption, TextBody } from "@components/typography/Text";
import { intoThemeDimension } from "@hooks/useThemeDimension";
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

const style = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: intoThemeDimension(2),
    right: intoThemeDimension(2),
  },
  card: {
    borderRadius: intoThemeDimension(1),
    paddingHorizontal: intoThemeDimension(2),
    paddingVertical: intoThemeDimension(1.5),
  },
});

const ANIMATION_DURATION_MS = 250;

export function Snackbar({ message, variant, visible }: SnackbarProps) {
  const insets = useSafeAreaInsets();
  const { popover, primary, destructive, secondary } = useTheme();

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

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }, { scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const indicatorColor = useMemo(
    () =>
      match(variant)
        .with(SnackbarVariant.Success, () => primary)
        .with(SnackbarVariant.Error, () => destructive)
        .with(SnackbarVariant.Info, () => secondary)
        .otherwise(() => secondary),
    [primary, destructive, secondary, variant],
  );

  if (!message) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        style.wrapper,
        { bottom: insets.bottom + intoThemeDimension(2) },
        animatedStyle,
      ]}
    >
      <Box
        backgroundColor={popover}
        borderLeftColor={indicatorColor}
        borderRadius={1}
        borderLeftWidth={4}
        style={style.card}
      >
        <TextCaption color={indicatorColor}>Saved</TextCaption>
        <TextBody color="fgPopover">{message}</TextBody>
      </Box>
    </Animated.View>
  );
}
