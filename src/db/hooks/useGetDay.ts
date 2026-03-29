import { useCallback, useState } from "react";
import type { DayTotals, Meal } from "@db/schemas";
import { useRepositories } from "@db/context/DatabaseProvider";
import type { MealFoodWithFood } from "@db/repositories/MealFoodRepository";
import { useFocusEffect } from "@react-navigation/native";

export type MealWithFoods = Meal & {
  foods: MealFoodWithFood[];
};

type DaySnapshot = {
  totalsResult: DayTotals | null;
  mealsWithFoods: MealWithFoods[];
};

type UseGetDayResult = {
  macros: DayTotals | null;
  meals: MealWithFoods[] | null;
  /** Re-fetch day totals and meals (e.g. after mutating logged items while this screen stays focused). */
  reload: () => void;
};

/**
 * Fetches day totals (macros) and all meals with their foods for a given UTC day.
 * @param dayUtcSeconds - Start-of-day in UTC as unix epoch seconds (e.g. from utcStartOfDaySeconds()).
 */
export function useGetDay(dayUtcSeconds: number): UseGetDayResult {
  const { meal: mealRepo, mealFood: mealFoodRepo } = useRepositories();
  const [macros, setMacros] = useState<DayTotals | null>(null);
  const [meals, setMeals] = useState<MealWithFoods[] | null>(null);

  const fetchDaySnapshot =
    useCallback(async (): Promise<DaySnapshot | null> => {
      const [totalsResult, mealsResult] = await Promise.all([
        mealRepo.getDayTotals(dayUtcSeconds),
        mealRepo.getMealsByDay(dayUtcSeconds),
      ]);

      if (!mealsResult) {
        return null;
      }

      // Serialize per-meal loads: repositories cache one prepared statement per
      // query name (`getMealFoodsByMealId`). Parallel `executeAsync` on that same
      // statement interleaves bindings/results and can attach the wrong foods to
      // each meal until the next full reload.
      const mealsWithFoods: MealWithFoods[] = [];
      for (const meal of mealsResult) {
        const foods = await mealFoodRepo.getMealFoodsByMealId(meal.id);
        mealsWithFoods.push({
          ...meal,
          foods: foods ?? [],
        });
      }

      return { totalsResult: totalsResult ?? null, mealsWithFoods };
    }, [dayUtcSeconds, mealRepo, mealFoodRepo]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      fetchDaySnapshot().then((data) => {
        if (!active || !data) return;
        setMacros(data.totalsResult);
        setMeals(data.mealsWithFoods);
      });
      return () => {
        active = false;
      };
    }, [fetchDaySnapshot]),
  );

  const reload = useCallback(() => {
    fetchDaySnapshot().then((data) => {
      if (!data) return;
      setMacros(data.totalsResult);
      setMeals(data.mealsWithFoods);
    });
  }, [fetchDaySnapshot]);

  return { macros, meals, reload };
}
