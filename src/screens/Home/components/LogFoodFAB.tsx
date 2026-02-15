import { useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { HomeStackParamsList } from "../../../AppTabs";
import { Button } from "@components/buttons/Button";
import { Icon } from "@components/media/Icon";
import { spacing } from "@constants/theme";
import { StyleSheet, type LayoutChangeEvent } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

const TRANSLATE_DISTANCE = 80;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: spacing(2),
    right: spacing(2),
    bottom: spacing(2),
  },
});

type LogFoodFABProps = {
  /** 1 = visible, 0 = hidden (drives slide animation). */
  visible: SharedValue<number>;
  onLayout?: (event: LayoutChangeEvent) => void;
};

export function LogFoodFAB({ visible, onLayout }: LogFoodFABProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeStackParamsList>>();

  const handlePress = useCallback(() => {
    navigation.navigate("Search");
  }, [navigation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withTiming(visible.get() === 1 ? 0 : TRANSLATE_DISTANCE, {
          duration: 250,
        }),
      },
    ],
  }));

  return (
    <Animated.View
      style={[styles.container, animatedStyle]}
      onLayout={onLayout}
    >
      <Button
        variant="primary"
        leftIcon={<Icon community name="receipt-text-edit-outline" size="xs" />}
        onPress={handlePress}
      >
        Log food
      </Button>
    </Animated.View>
  );
}
