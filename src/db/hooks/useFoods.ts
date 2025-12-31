import { useCallback, useEffect, useState } from "react";
import { getDb } from "../database";
import type { FoodRow } from "../models";
import { FoodRepository } from "../repositories/FoodRepository";

export function useFoods(args?: { search?: string; barcode?: string | null }) {
  const [data, setData] = useState<FoodRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const db = await getDb();
      const repo = new FoodRepository(db);

      if (args?.barcode) {
        const one = await repo.getFoodByBarcode(args.barcode);
        setData(one ? [one] : []);
        return;
      }

      if (args?.search && args.search.trim().length > 0) {
        const rows = await repo.searchFoodsByName(args.search, 50);
        setData(rows);
        return;
      }

      // Default: show recently updated foods.
      const rows = await db.getAllAsync<FoodRow>(
        `
SELECT
  id, name, brand, barcode,
  calories_per_gram, protein_per_gram, carbs_per_gram, fat_per_gram,
  source, created_at, updated_at, deleted_at
FROM foods
WHERE deleted_at IS NULL
ORDER BY updated_at DESC
LIMIT 50;
        `.trim(),
      );
      setData(rows);
    } catch (e) {
      setError(e);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [args?.barcode, args?.search]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
