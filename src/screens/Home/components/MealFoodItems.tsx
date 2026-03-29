import { useCallback, useMemo } from "react";
import { VStack } from "@components/layout/VStack";
import { HStack } from "@components/layout/HStack";
import { Body, Caption } from "@components/typography/Text";
import { useTheme } from "@contexts/ThemeProvider";
import type { MealFoodWithFood } from "@db/repositories/MealFoodRepository";
import { LayoutChangeEvent, Pressable, View, StyleSheet } from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { spacing } from "@constants/theme";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { Icon } from "@components/media/Icon";
import { semiTransparent } from "@utils/colorUtils";
import { MealType } from "@db/schemas";

type MealFoodItemsProps = {
  foods: MealFoodWithFood[];
  onLayout?: (event: LayoutChangeEvent) => void;
  meal: MealType;
  onEdit: (mealFood: MealFoodWithFood) => void;
  onDelete: (mealFood: MealFoodWithFood) => void;
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  measurableView: {
    position: "absolute",
    width: "100%",
    flexDirection: "column",
    gap: spacing(1.5),
    paddingBottom: spacing(1),
  },
  swipeableItemStyle: {
    paddingHorizontal: spacing(2),
  },
  actionStyle: {
    paddingHorizontal: spacing(2),
    justifyContent: "center",
  },
});

type SwipeRowActionsProps = {
  prog: SharedValue<number>;
  drag: SharedValue<number>;
  onEditPress: () => void;
  onDeletePress: () => void;
};

function SwipeRowActions({
  prog,
  drag,
  onEditPress,
  onDeletePress,
}: SwipeRowActionsProps) {
  const iconSize = useSharedValue(0);
  const offsetStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: drag.value + 2 * iconSize.value }],
    flexDirection: "row",
    opacity: Number.isFinite(prog.value) ? prog.value : 1,
  }));

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      iconSize.set(event.nativeEvent.layout.width);
    },
    [iconSize],
  );

  const theme = useTheme();
  const positiveStyle = useMemo(
    () => ({ backgroundColor: semiTransparent(theme.semantic.secondary, 0.2) }),
    [theme.semantic.secondary],
  );
  const negativeStyle = useMemo(
    () => ({
      backgroundColor: semiTransparent(theme.semantic.destructive, 0.2),
    }),
    [theme.semantic.destructive],
  );

  return (
    <Animated.View style={offsetStyle}>
      <Pressable
        onLayout={onLayout}
        style={[styles.actionStyle, positiveStyle]}
        onPress={onEditPress}
      >
        <Icon name="edit" size="m" variant="secondary" inverted />
      </Pressable>
      <Pressable
        style={[styles.actionStyle, negativeStyle]}
        onPress={onDeletePress}
      >
        <Icon name="delete" size="m" variant="destructive" inverted />
      </Pressable>
    </Animated.View>
  );
}

type MealFoodItemProps = {
  mealFood: MealFoodWithFood;
  onEdit: (mealFood: MealFoodWithFood) => void;
  onDelete: (mealFood: MealFoodWithFood) => void;
};

function MealFoodItem({ mealFood, onEdit, onDelete }: MealFoodItemProps) {
  const theme = useTheme();
  const servingsText =
    mealFood.quantity === 1 ? "1 serving" : `${mealFood.quantity} servings`;
  const catalogueServing =
    mealFood.food.serving_size > 0 ? mealFood.food.serving_size : 1;
  const scale = mealFood.serving_size / catalogueServing;
  const foodCalories = Math.round(
    mealFood.quantity * mealFood.food.energy_per_serving * scale,
  );
  const foodName = mealFood.food.name;
  const brandText = mealFood.food.brand ? ` • ${mealFood.food.brand}` : "";

  return (
    <Swipeable
      renderRightActions={(prog, drag) => (
        <SwipeRowActions
          prog={prog}
          drag={drag}
          onEditPress={() => onEdit(mealFood)}
          onDeletePress={() => onDelete(mealFood)}
        />
      )}
      childrenContainerStyle={styles.swipeableItemStyle}
    >
      <VStack backgroundColor="transparent" paddingVertical={1} gap={0.5}>
        <HStack
          justifyContent="space-between"
          alignItems="flex-start"
          backgroundColor="transparent"
        >
          <VStack flex={1} backgroundColor="transparent">
            <Body>{foodName}</Body>
            {brandText ? (
              <Caption color={theme.text.muted}>
                {brandText.replace(" • ", "")}
              </Caption>
            ) : null}
          </VStack>
          <VStack alignItems="flex-end" backgroundColor="transparent">
            <Body>{foodCalories} kcal</Body>
            <Caption color={theme.text.muted}>{servingsText}</Caption>
          </VStack>
        </HStack>
      </VStack>
    </Swipeable>
  );
}

export function MealFoodItems({
  foods,
  onLayout,
  meal,
  onEdit,
  onDelete,
}: MealFoodItemsProps) {
  // We have this position relative / absolute set up to force children to render and be measured properly for the animation.
  return (
    <View style={styles.container}>
      <View style={styles.measurableView} onLayout={onLayout}>
        {foods.map((mealFood, i) => (
          <MealFoodItem
            key={`${meal}_${mealFood.id}_${i}`}
            mealFood={mealFood}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </View>
    </View>
  );
}
