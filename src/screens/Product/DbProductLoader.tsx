import { useEffect, useMemo, useState } from "react";
import { useRepositories } from "@db/context/DatabaseProvider";
import type { Food } from "@db/schemas";
import type { GetProductDetails } from "@api/validators/getProductDetails";
import { ProductContent } from "./ProductContent";

function foodToNutriments(food: Food): GetProductDetails["nutriments"] {
  const values = {
    energy: food.energy_per_serving,
    proteins: food.proteins_per_serving,
    carbohydrates: food.carbohydrates_per_serving,
    fat: food.fat_per_serving,
  };
  const isPer100g = food.unit === "g" && food.serving_size === 100;
  if (isPer100g) {
    return { per100g: values, perServing: undefined };
  }
  return { per100g: undefined, perServing: values };
}

export function DbProductLoader({ foodId }: { foodId: number }) {
  const { food: foodRepo } = useRepositories();
  const [food, setFood] = useState<Food | null>(null);

  useEffect(() => {
    foodRepo.getFoodByIdentifier({ id: foodId }).then(setFood);
  }, [foodRepo, foodId]);

  const nutriments = useMemo(() => (food ? foodToNutriments(food) : null), [food]);

  if (!food || !nutriments) return null;

  return (
    <ProductContent
      foodId={food.id}
      name={food.name}
      brand={food.brand ?? ""}
      nutriments={nutriments}
      servingSize={food.serving_size}
      servingsUnit={food.unit}
    />
  );
}
