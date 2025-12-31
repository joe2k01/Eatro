import { useCallback, useState } from "react";
import { getDb } from "../database";
import {
  FoodEntryRepository,
  type InsertEntryInput,
} from "../repositories/FoodEntryRepository";

export function useLogFood() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown>(null);

  const logFood = useCallback(async (input: InsertEntryInput) => {
    setLoading(true);
    setError(null);
    try {
      const db = await getDb();
      const repo = new FoodEntryRepository(db);
      return await repo.insertEntry(input);
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { logFood, loading, error };
}
