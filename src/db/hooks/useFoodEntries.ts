import { useCallback, useEffect, useState } from "react";
import { getDb } from "../database";
import type { FoodEntryRow } from "../models";
import { FoodEntryRepository } from "../repositories/FoodEntryRepository";

export function useFoodEntries(dayStartTs: number) {
  const [data, setData] = useState<FoodEntryRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const db = await getDb();
      const repo = new FoodEntryRepository(db);
      const rows = await repo.getEntriesByDay(dayStartTs);
      setData(rows);
    } catch (e) {
      setError(e);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [dayStartTs]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
