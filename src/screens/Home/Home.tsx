import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { format } from "date-fns";
import { StyleSheet } from "react-native";
import { AvatarButton } from "./components/AvatarButton";
import { Display, Caption, Title } from "@components/typography/Text";
import { useStorage } from "@hooks/useStorage";
import { Goals } from "@constants/storage/validators";
import { useTheme } from "@contexts/ThemeProvider";
import { VStack } from "@components/layout/VStack";
import { HStack } from "@components/layout/HStack";
import { DonutChart, useDonut } from "@components/charts";
import { MacroProgress } from "./components/MacroProgress";
import { useMemo, useState } from "react";
import { useGetDay } from "@db/hooks/useGetDay";
import { utcStartOfTodaySeconds } from "@db/utils/utc";
import { MealItem } from "./components/MealItem";
import { useDynamicNavigationOptions } from "@hooks/useDynamicNavigationOptions";
import { HeaderDatePicker } from "./components/HeaderDatePicker";
import { LogFoodFAB } from "./components/LogFoodFAB";
import { spacing } from "@constants/theme";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from "react-native-reanimated";

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing(2),
    paddingTop: spacing(1),
    gap: spacing(4),
  },
});

export const homeHeaderOptions = {
  headerTitle: () => <Title>Today, {format(new Date(), "MMMM do")}</Title>,
  headerLeft: () => <AvatarButton />,
} satisfies NativeStackNavigationOptions;

const defaultGoals: Goals = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 50,
};

const macroKeys: Exclude<keyof Goals, "calories">[] = [
  "protein",
  "carbs",
  "fat",
];

export function Home() {
  const [dayUtcSeconds, setDayUtcSeconds] = useState(utcStartOfTodaySeconds());
  const headerOptions = useMemo(() => {
    return {
      ...homeHeaderOptions,
      headerTitle: () => (
        <HeaderDatePicker
          dayUtcSeconds={dayUtcSeconds}
          setDayUtcSeconds={setDayUtcSeconds}
        />
      ),
    };
  }, [dayUtcSeconds]);
  useDynamicNavigationOptions(headerOptions);

  const { macros, meals } = useGetDay(dayUtcSeconds);

  const day = useMemo(
    () => ({
      total_calories: macros?.energy ?? 0,
      total_protein: macros?.proteins ?? 0,
      total_carbs: macros?.carbohydrates ?? 0,
      total_fat: macros?.fat ?? 0,
    }),
    [macros],
  );

  const cals = useMemo(() => {
    return Math.round(day.total_calories);
  }, [day.total_calories]);

  const { data: goals } = useStorage("goals", defaultGoals);

  const theme = useTheme();

  const donutData = useDonut([
    { key: "calories", value: cals, color: theme.semantic.accent },
  ]);

  const overCalories = useMemo(() => {
    return cals > (goals?.calories ?? 0);
  }, [cals, goals?.calories]);

  const caloriesTextColor = overCalories
    ? theme.semantic.destructive
    : theme.text.primary;
  const captionTextColor = overCalories
    ? theme.semantic.destructive
    : theme.text.secondary;

  // FAB scroll-direction tracking
  const fabVisible = useSharedValue(1);
  const lastOffset = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const currentOffset = event.contentOffset.y;
      if (currentOffset > lastOffset.get() && currentOffset > 0) {
        fabVisible.set(0);
      } else {
        fabVisible.set(1);
      }
      lastOffset.set(currentOffset);
    },
  });

  return (
    <VStack flex={1}>
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Calorie card */}
        <VStack
          borderRadius={10}
          backgroundColor={theme.surface.secondary}
          padding={2}
          gap={2}
        >
          <HStack
            backgroundColor="transparent"
            alignItems="center"
            justifyContent="space-between"
          >
            <VStack backgroundColor={"transparent"}>
              <Display color={caloriesTextColor}>
                {cals} / {goals?.calories}
              </Display>
              <Caption color={captionTextColor}>kcal remaining</Caption>
            </VStack>
            <DonutChart
              donutData={donutData}
              width={"30%"}
              total={goals?.calories}
            />
          </HStack>
          <HStack
            justifyContent="space-between"
            alignItems="center"
            backgroundColor="transparent"
          >
            {/* TODO: Day totals are now derived from meals (days table removed). */}
            {macroKeys.map((macro) => (
              <MacroProgress
                key={macro}
                label={macro}
                consumedGrams={
                  macro === "protein"
                    ? (day?.total_protein ?? 0)
                    : macro === "carbs"
                      ? (day?.total_carbs ?? 0)
                      : (day?.total_fat ?? 0)
                }
              />
            ))}
          </HStack>
        </VStack>

        {/* Recent meals */}
        <VStack gap={1.5}>
          <Title>Recent meals</Title>
          {meals && meals.length > 0 ? (
            <VStack gap={1.5}>
              {meals.map((meal) => (
                <MealItem key={meal.id} meal={meal} />
              ))}
            </VStack>
          ) : (
            <VStack
              borderRadius={8}
              backgroundColor={theme.surface.secondary}
              padding={2}
              alignItems="center"
            >
              <Caption color={theme.text.muted}>No meals logged today</Caption>
            </VStack>
          )}
        </VStack>
      </Animated.ScrollView>

      <LogFoodFAB visible={fabVisible} />
    </VStack>
  );
}

export type HomeParams = undefined;
