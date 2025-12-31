import { useCallback, useState } from "react";
import { getDb } from "../database";
import { FoodEntryRepository } from "../repositories/FoodEntryRepository";

export function useLogMeal() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown>(null);

  const logMeal = useCallback(
    async (args: {
      mealId: number;
      eaten_at: number;
      day_start_ts?: number;
      meal_type: number;
    }) => {
      setLoading(true);
      setError(null);
      try {
        const db = await getDb();
        const repo = new FoodEntryRepository(db);

        return await repo.logMealAsEntries({
          mealId: args.mealId,
          eaten_at: args.eaten_at,
          day_start_ts: args.day_start_ts,
          meal_type: args.meal_type,
        });
      } catch (e) {
        setError(e);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { logMeal, loading, error };
}
