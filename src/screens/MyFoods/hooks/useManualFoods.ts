import { useCallback, useState } from "react";
import type { Food } from "@db/schemas";
import { useRepositories } from "@db/context/DatabaseProvider";
import { useFocusEffect } from "@react-navigation/native";

const PAGE_SIZE = 50;

export function useManualFoods(filterQuery: string) {
  const { food: foodRepo } = useRepositories();
  const [foods, setFoods] = useState<Food[]>([]);

  const reload = useCallback(() => {
    let active = true;

    async function load() {
      const result = filterQuery.trim()
        ? await foodRepo.searchManualFoods(filterQuery.trim(), PAGE_SIZE)
        : await foodRepo.getManualFoods(PAGE_SIZE, 0);

      if (active) setFoods(result ?? []);
    }

    load();
    return () => {
      active = false;
    };
  }, [foodRepo, filterQuery]);

  useFocusEffect(reload);

  return foods;
}
