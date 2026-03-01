import { useEffect, useState } from "react";
import type { Food } from "@db/schemas";
import { useRepositories } from "@db/context/DatabaseProvider";

const MANUAL_SEARCH_LIMIT = 10;

export function useSearchManualFoods(query: string) {
  const { food: foodRepo } = useRepositories();
  const [results, setResults] = useState<Food[]>([]);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }

    let active = true;

    async function search() {
      const data = await foodRepo.searchManualFoods(
        trimmed,
        MANUAL_SEARCH_LIMIT,
      );
      if (active) setResults(data ?? []);
    }

    search();

    return () => {
      active = false;
    };
  }, [foodRepo, query]);

  return results;
}
