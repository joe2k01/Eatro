import { useCallback, useEffect, useState } from "react";
import { getDb } from "../database";
import type { DayRow } from "../models";
import { DayRepository } from "../repositories/DayRepository";

export function useDailySummary(dayStartTs: number) {
  const [data, setData] = useState<DayRow | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const db = await getDb();
      const repo = new DayRepository(db);
      const row = await repo.getDaySummary(dayStartTs);
      setData(row);
    } catch (e) {
      setError(e);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [dayStartTs]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
