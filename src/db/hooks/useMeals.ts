import { useCallback, useEffect, useState } from "react";
import { getDb } from "../database";
import type { MealRow } from "../models";
import {
  MealRepository,
  type MealWithItems,
} from "../repositories/MealRepository";

export function useMeals() {
  const [data, setData] = useState<MealRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const db = await getDb();
      const rows = await db.getAllAsync<MealRow>(
        `
SELECT id, name, created_at, updated_at, deleted_at
FROM meals
WHERE deleted_at IS NULL
ORDER BY updated_at DESC
LIMIT 100;
        `.trim(),
      );
      setData(rows);
    } catch (e) {
      setError(e);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getMealWithItems = useCallback(
    async (mealId: number): Promise<MealWithItems | null> => {
      const db = await getDb();
      const repo = new MealRepository(db);
      return await repo.getMealWithItems(mealId);
    },
    [],
  );

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, loading, error, refetch, getMealWithItems };
}
