import type { GetProductDetails } from "@api/validators/getProductDetails";
import { StyleSheet } from "react-native";
import { AvatarButton } from "./components/AvatarButton";
import { Display, Caption, Title } from "@components/typography/Text";
import { useStorage } from "@hooks/useStorage";
import { Goals } from "@constants/storage/validators";
import { useTheme } from "@contexts/ThemeProvider";
import { Screen } from "@components/layout/Screen";
import { VStack } from "@components/layout/VStack";
import { HStack } from "@components/layout/HStack";
import { DonutChart, useDonut } from "@components/charts";
import { MacroProgress } from "./components/MacroProgress";
import { useCallback, useMemo, useRef, useState } from "react";
import type { LayoutChangeEvent } from "react-native";
import { useGetDay, type MealWithFoods } from "@db/hooks/useGetDay";
import { utcStartOfTodaySeconds } from "@db/utils/utc";
import { MealItem } from "./components/MealItem";
import { HeaderDatePicker } from "./components/HeaderDatePicker";
import { LogFoodFAB } from "./components/LogFoodFAB";
import { spacing } from "@constants/theme";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from "react-native-reanimated";
import type { TrayApi } from "@components/layout/Tray";
import {
  ProductTray,
  type ProductTrayAcceptResult,
} from "@screens/Product/ProductTray";
import {
  ConfirmDeleteTray,
  SnackbarVariant,
  useSnackbar,
} from "@components/feedback";
import { useRepositories } from "@db/context/DatabaseProvider";
import type { MealFoodWithFood } from "@db/repositories/MealFoodRepository";
import type { Food } from "@db/schemas";
function nutrimentsFromLoggedFood(food: Food): GetProductDetails["nutriments"] {
  return {
    per100g: undefined,
    perServing: {
      energy: food.energy_per_serving,
      proteins: food.proteins_per_serving,
      carbohydrates: food.carbohydrates_per_serving,
      fat: food.fat_per_serving,
    },
  };
}

const IDLE_EDIT_NUTRIMENTS: GetProductDetails["nutriments"] = {
  per100g: undefined,
  perServing: {
    energy: 0,
    proteins: 0,
    carbohydrates: 0,
    fat: 0,
  },
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: spacing(1),
    gap: spacing(4),
  },
});

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
  const { meal: mealRepo, mealFood: mealFoodRepo } = useRepositories();
  const showSnackbar = useSnackbar();
  const deleteTrayRef = useRef<TrayApi>(null);
  const editTrayRef = useRef<TrayApi>(null);
  const [deleteTarget, setDeleteTarget] = useState<MealFoodWithFood | null>(
    null,
  );
  const [editTarget, setEditTarget] = useState<MealFoodWithFood | null>(null);

  const [dayUtcSeconds, setDayUtcSeconds] = useState(utcStartOfTodaySeconds());

  const { macros, meals, reload } = useGetDay(dayUtcSeconds);

  const handleDeleteFood = useCallback(
    (_meal: MealWithFoods, mealFood: MealFoodWithFood) => {
      setDeleteTarget(mealFood);
      deleteTrayRef.current?.openTray();
    },
    [],
  );

  const handleEditFood = useCallback(
    (_meal: MealWithFoods, mealFood: MealFoodWithFood) => {
      setEditTarget(mealFood);
      editTrayRef.current?.openTray();
    },
    [],
  );

  const handleCancelDelete = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  const handleDismissEditTray = useCallback(async () => {
    setEditTarget(null);
    await editTrayRef.current?.closeTray();
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    const ok = await mealRepo.deleteMealFoodTx(
      { mealFoodId: target.id, nowMs: Date.now() },
      mealFoodRepo,
    );
    if (!ok) {
      showSnackbar({
        message: "Could not remove food. Try again.",
        variant: SnackbarVariant.Error,
      });
      return;
    }
    showSnackbar({
      message: "Food removed",
      variant: SnackbarVariant.Success,
    });
    setDeleteTarget(null);
    reload();
  }, [deleteTarget, mealRepo, mealFoodRepo, reload, showSnackbar]);

  const handleAcceptEdit = useCallback(
    async (result: ProductTrayAcceptResult) => {
      if (!editTarget) return;
      const target = editTarget;
      const ok = await mealRepo.updateMealFoodTx(
        {
          mealFoodId: target.id,
          newQuantityServings: result.servingsValue,
          newServingSize: result.servingSizeValue,
          nowMs: Date.now(),
        },
        mealFoodRepo,
      );
      if (!ok) {
        showSnackbar({
          message: "Could not update food. Try again.",
          variant: SnackbarVariant.Error,
        });
        return;
      }
      showSnackbar({
        message: "Food updated",
        variant: SnackbarVariant.Success,
      });
      setEditTarget(null);
      reload();
    },
    [editTarget, mealRepo, mealFoodRepo, reload, showSnackbar],
  );

  const memoizedEditTrayProps = useMemo(() => {
    if (!editTarget) {
      return {
        foodId: null as number | null,
        name: "",
        brand: "",
        nutriments: IDLE_EDIT_NUTRIMENTS,
        servingSize: 100,
        servingsUnit: "",
        initialServings: 1,
        initialServingSize: 100,
      };
    }
    const { food, food_id, quantity } = editTarget;
    return {
      foodId: food_id,
      name: food.name,
      brand: food.brand ?? "",
      nutriments: nutrimentsFromLoggedFood(food),
      servingSize: food.serving_size,
      servingsUnit: food.unit,
      initialServings: quantity,
      initialServingSize: editTarget.serving_size,
    };
  }, [editTarget]);

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

  // FAB measurement + scroll-direction tracking
  const [fabHeight, setFabHeight] = useState(0);

  const handleFabLayout = useCallback((e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height + spacing(3);
    setFabHeight((prev) => (prev === h ? prev : h));
  }, []);

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
    <Screen
      noGuard
      headerLeft={<AvatarButton />}
      headerCenter={
        <HeaderDatePicker
          dayUtcSeconds={dayUtcSeconds}
          setDayUtcSeconds={setDayUtcSeconds}
        />
      }
    >
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
              <Caption color={captionTextColor}>kcal</Caption>
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
        <VStack gap={1.5} paddingBottom={fabHeight}>
          <Title>Recent meals</Title>
          {meals && meals.length > 0 ? (
            <VStack gap={1.5}>
              {meals.map((meal) => (
                <MealItem
                  key={meal.id}
                  meal={meal}
                  onEditFood={handleEditFood}
                  onDeleteFood={handleDeleteFood}
                />
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

      <LogFoodFAB visible={fabVisible} onLayout={handleFabLayout} />

      <ConfirmDeleteTray
        trayRef={deleteTrayRef}
        foodName={deleteTarget?.food.name ?? ""}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      <ProductTray
        trayRef={editTrayRef}
        {...memoizedEditTrayProps}
        mode="update"
        onAccept={handleAcceptEdit}
        onDismiss={handleDismissEditTray}
      />
    </Screen>
  );
}

export type HomeParams = undefined;
