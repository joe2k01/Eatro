import { useCallback, useEffect, useState } from "react";
import { useRepositories } from "@db/context/DatabaseProvider";
import type { CustomMeal } from "@db/schemas";

export function useCustomMeals(filterQuery: string) {
  const { customMeal: repo } = useRepositories();
  const [meals, setMeals] = useState<CustomMeal[]>([]);

  const refresh = useCallback(async () => {
    const trimmed = filterQuery.trim();
    const result = trimmed
      ? await repo.searchCustomMeals(trimmed)
      : await repo.getAllCustomMeals();

    setMeals(result ?? []);
  }, [filterQuery, repo]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return meals;
}
