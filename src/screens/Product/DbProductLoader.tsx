import { useEffect, useState } from "react";
import { useRepositories } from "@db/context/DatabaseProvider";
import type { Food } from "@db/schemas";
import type { GetProductDetails } from "@api/validators/getProductDetails";
import { ProductContent } from "./ProductContent";

function foodToNutriments(food: Food): GetProductDetails["nutriments"] {
  return {
    per100g: undefined,
    perServing: {
      energy: food.energy_per_serving,
      proteins: food.proteins_per_serving,
      carbohydrates: food.carbohydrates_per_serving,
      fat: food.fat_per_serving,
    },
  };
}

export function DbProductLoader({ foodId }: { foodId: number }) {
  const { food: foodRepo } = useRepositories();
  const [food, setFood] = useState<Food | null>(null);

  useEffect(() => {
    foodRepo.getFoodById(foodId).then(setFood);
  }, [foodRepo, foodId]);

  if (!food) return null;

  return (
    <ProductContent
      foodId={food.id}
      name={food.name}
      brand={food.brand ?? ""}
      nutriments={foodToNutriments(food)}
      servingSize={food.serving_size}
      servingsUnit={food.unit}
    />
  );
}
