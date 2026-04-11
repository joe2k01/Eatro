import { useCallback, useMemo } from "react";
import { HStack } from "@components/layout/HStack";
import { VStack } from "@components/layout/VStack";
import { Body, Caption } from "@components/typography/Text";
import { useTheme } from "@contexts/ThemeProvider";
import { MealType } from "@db/schemas";
import { format } from "date-fns";
import type { MealWithFoods } from "@db/hooks/useGetDay";
import type { MealFoodWithFood } from "@db/repositories/MealFoodRepository";
import { Icon } from "@components/media/Icon";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  useDerivedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { LayoutChangeEvent, Pressable } from "react-native";
import { Box } from "@components/layout/Box";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import type { ComponentProps } from "react";
import { MealFoodItems } from "./MealFoodItems";
import { semiTransparent } from "@utils/colorUtils";

type MealItemProps = {
  meal: MealWithFoods;
  onEditFood: (meal: MealWithFoods, mealFood: MealFoodWithFood) => void;
  onDeleteFood: (meal: MealWithFoods, mealFood: MealFoodWithFood) => void;
};

const mealTypeLabels: Record<MealType, string> = {
  [MealType.Breakfast]: "Breakfast",
  [MealType.Lunch]: "Lunch",
  [MealType.Dinner]: "Dinner",
  [MealType.Snack]: "Snack",
  [MealType.Custom]: "Custom",
};

type MaterialCommunityIconsProps = ComponentProps<
  typeof MaterialCommunityIcons
>;

const mealTypeIcons: Record<
  MealType,
  { name: MaterialCommunityIconsProps["name"]; community: true }
> = {
  [MealType.Breakfast]: { name: "food-croissant", community: true },
  [MealType.Lunch]: { name: "food", community: true },
  [MealType.Dinner]: { name: "silverware-fork-knife", community: true },
  [MealType.Snack]: { name: "cookie", community: true },
  [MealType.Custom]: { name: "food-variant", community: true },
};

const ANIMATION_TIMING_CONFIG = {
  duration: 300,
  easing: Easing.out(Easing.ease),
};

export function MealItem({ meal, onEditFood, onDeleteFood }: MealItemProps) {
  const theme = useTheme();
  const isExpanded = useSharedValue(false);

  const mealLabel = useMemo(() => {
    if (meal.type === MealType.Custom && meal.custom_type) {
      return meal.custom_type;
    }
    return mealTypeLabels[meal.type];
  }, [meal.type, meal.custom_type]);

  const mealItems = useMemo(() => {
    return meal.foods.map(({ food: { name } }) => name).join(", ");
  }, [meal.foods]);

  const timeLabel = useMemo(() => {
    return format(new Date(meal.created_at), "h:mm a");
  }, [meal.created_at]);

  const calories = useMemo(() => {
    return Math.round(meal.energy);
  }, [meal.energy]);

  const mealIcon = useMemo(() => {
    return mealTypeIcons[meal.type];
  }, [meal.type]);

  const chevronRotation = useSharedValue(0);
  const animatedChevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.get()}deg` }],
  }));

  const contentHeight = useSharedValue(0);
  const contentWrapperHeight = useDerivedValue(() =>
    withTiming(
      contentHeight.get() * Number(isExpanded.get()),
      ANIMATION_TIMING_CONFIG,
    ),
  );
  const contentWrapperOpacity = useDerivedValue(() =>
    withTiming(isExpanded.get() ? 1 : 0, ANIMATION_TIMING_CONFIG),
  );
  const contentWrapperStyle = useAnimatedStyle(() => ({
    height: contentWrapperHeight.get(),
    opacity: contentWrapperOpacity.get(),
  }));

  // Caption animation: slide down and fade away when expanding, slide up and fade in when collapsing
  const captionOpacity = useDerivedValue(() =>
    withTiming(isExpanded.get() ? 0 : 1, ANIMATION_TIMING_CONFIG),
  );
  const captionTranslateY = useDerivedValue(() =>
    withTiming(isExpanded.get() ? 10 : 0, ANIMATION_TIMING_CONFIG),
  );
  const captionScale = useDerivedValue(() =>
    withTiming(isExpanded.get() ? 0.95 : 1, ANIMATION_TIMING_CONFIG),
  );
  const captionAnimatedStyle = useAnimatedStyle(() => ({
    opacity: captionOpacity.get(),
    transform: [
      { translateY: captionTranslateY.get() },
      { scale: captionScale.get() },
    ],
  }));

  const onContentLayout = (event: LayoutChangeEvent) => {
    contentHeight.set(event.nativeEvent.layout.height);
  };

  const handlePress = useCallback(() => {
    const newExpanded = !isExpanded.get();
    isExpanded.set(newExpanded);

    chevronRotation.set(
      withTiming(newExpanded ? 180 : 0, ANIMATION_TIMING_CONFIG),
    );
  }, [isExpanded, chevronRotation]);

  const handleEditMealFood = useCallback(
    (mealFood: MealFoodWithFood) => {
      onEditFood(meal, mealFood);
    },
    [meal, onEditFood],
  );

  const handleDeleteMealFood = useCallback(
    (mealFood: MealFoodWithFood) => {
      onDeleteFood(meal, mealFood);
    },
    [meal, onDeleteFood],
  );

  const iconBackgroundColor = useMemo(() => {
    const primaryColor = theme.semantic.primary;
    if (primaryColor.startsWith("#")) {
      return semiTransparent(primaryColor, 0.2);
    }
    return primaryColor;
  }, [theme.semantic.primary]);

  return (
    <VStack
      borderRadius={8}
      overflow="hidden"
      backgroundColor={theme.surface.secondary}
    >
      <Pressable onPress={handlePress}>
        <HStack
          padding={2}
          alignItems="center"
          justifyContent="space-between"
          gap={2}
          backgroundColor="transparent"
        >
          <Box
            borderRadius={8}
            backgroundColor={iconBackgroundColor}
            padding={1}
            alignItems="center"
            justifyContent="center"
          >
            <Icon
              name={mealIcon.name}
              community={mealIcon.community}
              size="m"
              color={theme.semantic.primary}
            />
          </Box>
          <VStack flex={1} backgroundColor="transparent">
            <Body>{mealLabel}</Body>
            <Animated.View style={captionAnimatedStyle}>
              <Caption
                color={theme.text.muted}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {mealItems}
              </Caption>
            </Animated.View>
          </VStack>
          <VStack alignItems="flex-end" backgroundColor="transparent">
            <Body>{calories} kcal</Body>
            <Caption color={theme.text.muted}>{timeLabel}</Caption>
          </VStack>
          <Animated.View style={animatedChevronStyle}>
            <Icon
              name="chevron-down"
              size="xs"
              color={theme.text.muted}
              community
            />
          </Animated.View>
        </HStack>
      </Pressable>

      {meal.foods.length > 0 && (
        <Animated.View style={contentWrapperStyle}>
          <MealFoodItems
            foods={meal.foods}
            onLayout={onContentLayout}
            meal={meal.type}
            onEdit={handleEditMealFood}
            onDelete={handleDeleteMealFood}
          />
        </Animated.View>
      )}

      <HStack
        justifyContent="space-between"
        backgroundColor="transparent"
        paddingHorizontal={2}
        paddingVertical={2}
        borderTopColor={theme.surface.tertiary}
        borderTopWidth={1}
      >
        <Caption color={theme.text.muted}>
          Protein: {Math.round(meal.proteins)}g
        </Caption>
        <Caption color={theme.text.muted}>
          Carbs: {Math.round(meal.carbohydrates)}g
        </Caption>
        <Caption color={theme.text.muted}>Fat: {Math.round(meal.fat)}g</Caption>
      </HStack>
    </VStack>
  );
}
