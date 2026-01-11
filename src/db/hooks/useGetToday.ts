import { useSQLiteContext } from "expo-sqlite";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { MealRepository } from "@db/repositories/MealRepository";
import { utcStartOfTodaySeconds } from "@db/utils/utc";
import type { Meal } from "@db/schemas";

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
  const db = useSQLiteContext();
  const [macros, setMacros] = useState<DayTotals | null>(null);
  const [meals, setMeals] = useState<Meal[] | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchToday = useCallback(async () => {
    const dayUtcSeconds = utcStartOfTodaySeconds();
    const repo = new MealRepository(db);

    const [totalsResult, mealsResult] = await Promise.all([
      repo.getDayTotals(dayUtcSeconds),
      repo.getMealsByDay(dayUtcSeconds),
    ]);

    setMacros(totalsResult);
    setMeals(mealsResult);
    setLoading(false);
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchToday();
    }, [fetchToday]),
  );

  return { macros, meals, loading };
}

