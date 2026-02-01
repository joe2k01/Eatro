import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { utcStartOfTodaySeconds } from "@db/utils/utc";
import type { Meal } from "@db/schemas";
import { useRepositories } from "@db/context/DatabaseProvider";
import type { MealFoodWithFood } from "@db/repositories/MealFoodRepository";

type DayTotals = {
  energy: number;
  proteins: number;
  carbohydrates: number;
  fat: number;
};

export type MealWithFoods = Meal & {
  foods: MealFoodWithFood[];
};

type UseGetTodayResult = {
  macros: DayTotals | null;
  meals: MealWithFoods[] | null;
  loading: boolean;
};

/**
 * Hook to fetch today's macros (day totals) and meals with their foods.
 * Automatically refetches when the screen is focused.
 */
export function useGetToday(): UseGetTodayResult {
  const { meal: mealRepo, mealFood: mealFoodRepo } = useRepositories();
  const [macros, setMacros] = useState<DayTotals | null>(null);
  const [meals, setMeals] = useState<MealWithFoods[] | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchToday = useCallback(async () => {
    const dayUtcSeconds = utcStartOfTodaySeconds();

    const [totalsResult, mealsResult] = await Promise.all([
      mealRepo.getDayTotals(dayUtcSeconds),
      mealRepo.getMealsByDay(dayUtcSeconds),
    ]);

    if (!mealsResult) {
      setMacros(totalsResult);
      setMeals(null);
      setLoading(false);
      return;
    }

    // Fetch foods for each meal
    const mealsWithFoods = await Promise.all(
      mealsResult.map(async (meal) => {
        const mealFoods = await mealFoodRepo.getMealFoodsByMealId(meal.id);
        return {
          ...meal,
          foods: mealFoods ?? [],
        };
      }),
    );

    setMacros(totalsResult);
    setMeals(mealsWithFoods);
    setLoading(false);
  }, [mealRepo, mealFoodRepo]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchToday();
    }, [fetchToday]),
  );

  return { macros, meals, loading };
}
