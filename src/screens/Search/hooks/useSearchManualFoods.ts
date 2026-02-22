import { useEffect, useState } from "react";
import type { Food } from "@db/schemas";
import { useRepositories } from "@db/context/DatabaseProvider";

const MANUAL_SEARCH_LIMIT = 10;

export function useSearchManualFoods(query: string) {
  const { food: foodRepo } = useRepositories();
  const [results, setResults] = useState<Food[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    let active = true;
    foodRepo
      .searchManualFoods(query.trim(), MANUAL_SEARCH_LIMIT)
      .then((data) => {
        if (active) setResults(data ?? []);
      });

    return () => {
      active = false;
    };
  }, [foodRepo, query]);

  return results;
}
