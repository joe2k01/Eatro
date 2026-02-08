import { useCallback, useState } from "react";
import type { DayTotals, Meal } from "@db/schemas";
import { useRepositories } from "@db/context/DatabaseProvider";
import type { MealFoodWithFood } from "@db/repositories/MealFoodRepository";
import { useFocusEffect } from "@react-navigation/native";

export type MealWithFoods = Meal & {
  foods: MealFoodWithFood[];
};

type UseGetDayResult = {
  macros: DayTotals | null;
  meals: MealWithFoods[] | null;
};

/**
 * Fetches day totals (macros) and all meals with their foods for a given UTC day.
 * @param dayUtcSeconds - Start-of-day in UTC as unix epoch seconds (e.g. from utcStartOfDaySeconds()).
 */
export function useGetDay(dayUtcSeconds: number): UseGetDayResult {
  const { meal: mealRepo, mealFood: mealFoodRepo } = useRepositories();
  const [macros, setMacros] = useState<DayTotals | null>(null);
  const [meals, setMeals] = useState<MealWithFoods[] | null>(null);

  const reload = useCallback(() => {
    let active = true;

    async function load() {
      const [totalsResult, mealsResult] = await Promise.all([
        mealRepo.getDayTotals(dayUtcSeconds),
        mealRepo.getMealsByDay(dayUtcSeconds),
      ]);

      if (!mealsResult) {
        return;
      }

      const mealsWithFoods: MealWithFoods[] = await Promise.all(
        mealsResult.map(async (meal) => {
          const foods = await mealFoodRepo.getMealFoodsByMealId(meal.id);
          return {
            ...meal,
            foods: foods ?? [],
          };
        }),
      );

      if (!active) return;

      setMacros(totalsResult ?? null);
      setMeals(mealsWithFoods);
    }

    load();

    return () => {
      active = false;
    };
  }, [dayUtcSeconds, mealRepo, mealFoodRepo]);

  useFocusEffect(reload);

  return { macros, meals };
}
