import { useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import { Button } from "@components/buttons/Button";
import { Icon } from "@components/media/Icon";
import { spacing } from "@constants/theme";
import { StyleSheet } from "react-native";
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
};

export function LogFoodFAB({ visible }: LogFoodFABProps) {
  const navigation = useNavigation();

  const handlePress = useCallback(() => {
    navigation.navigate("Scanner");
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
    <Animated.View style={[styles.container, animatedStyle]}>
      <Button
        variant="primary"
        leftIcon={<Icon community name="barcode" size="xs" />}
        onPress={handlePress}
      >
        Log food
      </Button>
    </Animated.View>
  );
}
