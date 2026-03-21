import type { MealRSessionItem, MealRSessionTotals } from "./types";

export function computeSessionTotals(
  items: MealRSessionItem[],
): MealRSessionTotals {
  return items.reduce(
    (totals, item) => ({
      energy: totals.energy + item.energy,
      proteins: totals.proteins + item.proteins,
      carbohydrates: totals.carbohydrates + item.carbohydrates,
      fat: totals.fat + item.fat,
    }),
    { energy: 0, proteins: 0, carbohydrates: 0, fat: 0 },
  );
}
