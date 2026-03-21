import { useEffect, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import { useRepositories } from "@db/context/DatabaseProvider";
import type { CustomMeal } from "@db/schemas";

export function useCustomMeals(filterQuery: string) {
  const { customMeal: repo } = useRepositories();
  const isFocused = useIsFocused();
  const [meals, setMeals] = useState<CustomMeal[]>([]);

  useEffect(() => {
    if (!isFocused) return;
    let active = true;

    async function loadMeals() {
      const trimmed = filterQuery.trim();
      const result = trimmed
        ? await repo.searchCustomMeals(trimmed)
        : await repo.getAllCustomMeals();

      if (active) setMeals(result ?? []);
    }
    loadMeals();

    return () => {
      active = false;
    };
  }, [filterQuery, isFocused, repo]);

  return meals;
}
