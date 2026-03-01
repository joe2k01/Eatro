import { useCallback, useEffect, useState } from "react";
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
  const { limit = DEFAULT_LIMIT, refetchOnFocus = true } = options;

  useEffect(() => {
    const trimmed = query.trim();
    if (!refetchOnFocus && !trimmed) {
      setFoods([]);
      return;
    }
    let active = true;

    async function load() {
      const data = await foodRepo.searchManualFoods(trimmed, limit);
      if (active) setFoods(data ?? []);
    }
    load();

    return () => {
      active = false;
    };
  }, [foodRepo, query, limit, refetchOnFocus]);

  useFocusEffect(
    useCallback(() => {
      if (!refetchOnFocus) return;
      let active = true;

      async function load() {
        const trimmed = query.trim();
        const data = await foodRepo.searchManualFoods(trimmed, limit);
        if (active) setFoods(data ?? []);
      }
      load();

      return () => {
        active = false;
      };
    }, [foodRepo, query, limit, refetchOnFocus]),
  );

  return foods;
}
