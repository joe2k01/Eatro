import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { utcStartOfTodaySeconds } from "@db/utils/utc";
import type { Meal } from "@db/schemas";
import { useRepositories } from "@db/context/DatabaseProvider";

type DayTotals = {
  energy: number;
  proteins: number;
  carbohydrates: number;
  fat: number;
};

type UseGetTodayResult = {
  macros: DayTotals | null;
  meals: Meal[] | null;
  loading: boolean;
};

/**
 * Hook to fetch today's macros (day totals) and meals.
 * Automatically refetches when the screen is focused.
 */
export function useGetToday(): UseGetTodayResult {
  const { meal: mealRepo } = useRepositories();
  const [macros, setMacros] = useState<DayTotals | null>(null);
  const [meals, setMeals] = useState<Meal[] | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchToday = useCallback(async () => {
    const dayUtcSeconds = utcStartOfTodaySeconds();

    const [totalsResult, mealsResult] = await Promise.all([
      mealRepo.getDayTotals(dayUtcSeconds),
      mealRepo.getMealsByDay(dayUtcSeconds),
    ]);

    setMacros(totalsResult);
    setMeals(mealsResult);
    setLoading(false);
  }, [mealRepo]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchToday();
    }, [fetchToday]),
  );

  return { macros, meals, loading };
}
