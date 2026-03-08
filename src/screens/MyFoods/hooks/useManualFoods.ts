import { useCallback, useEffect, useRef, useState } from "react";
import type { Food } from "@db/schemas";
import { useRepositories } from "@db/context/DatabaseProvider";
import { useFocusEffect } from "@react-navigation/native";

const DEFAULT_LIMIT = 50;

export type UseManualFoodsOptions = {
  limit?: number;
  refetchOnFocus?: boolean;
};

export function useManualFoods(
  query: string,
  options: UseManualFoodsOptions = {},
) {
  const { food: foodRepo } = useRepositories();
  const [foods, setFoods] = useState<Food[]>([]);
  const requestVersionRef = useRef(0);
  const { limit = DEFAULT_LIMIT, refetchOnFocus = true } = options;

  const loadFoods = useCallback(
    async (rawQuery: string) => {
      const trimmed = rawQuery.trim();
      const requestVersion = ++requestVersionRef.current;
      const data = await foodRepo.searchManualFoods(trimmed, limit);

      // Ignore stale async responses from older queries/focus cycles.
      if (requestVersion !== requestVersionRef.current) return;
      setFoods(data ?? []);
    },
    [foodRepo, limit],
  );

  useEffect(() => {
    loadFoods(query);
  }, [query, limit, loadFoods]);

  useFocusEffect(
    useCallback(() => {
      if (!refetchOnFocus) return;
      loadFoods(query);

      return () => {
        requestVersionRef.current += 1;
      };
    }, [query, refetchOnFocus, loadFoods]),
  );

  return foods;
}
