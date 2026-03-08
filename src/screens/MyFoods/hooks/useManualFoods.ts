import { useEffect, useState } from "react";
import type { Food } from "@db/schemas";
import { useRepositories } from "@db/context/DatabaseProvider";
import { useIsFocused } from "@react-navigation/native";

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
  const isFocused = useIsFocused();
  const [foods, setFoods] = useState<Food[]>([]);
  const { limit = DEFAULT_LIMIT, refetchOnFocus = true } = options;
  // refetchOnFocus=true (MyFoods): load only while screen is focused.
  // refetchOnFocus=false (Search): load whenever query/limit change.
  const shouldLoad = !refetchOnFocus || isFocused;

  useEffect(() => {
    if (!shouldLoad) return;
    let active = true;

    async function loadFoods() {
      const data = await foodRepo.searchManualFoods(query, limit);
      if (active) setFoods(data ?? []);
    }
    loadFoods();

    return () => {
      active = false;
    };
  }, [foodRepo, query, limit, shouldLoad]);

  return foods;
}
