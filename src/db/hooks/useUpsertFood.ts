import type { GetProductDetails } from "@api/validators/getProductDetails";
import { useEffect, useState } from "react";
import { Food, FoodSource } from "@db/schemas";
import { useRepositories } from "@db/context/DatabaseProvider";

type Nutriments = GetProductDetails["nutriments"];
type NutrimentsVariant = NonNullable<Nutriments[keyof Nutriments]>;

type OperatingFood = Omit<Food, "id" | "deleted_at">;

function isFood(
  value: GetProductDetails | OperatingFood,
): value is OperatingFood {
  return (
    typeof value === "object" &&
    value !== null &&
    "serving_size" in value &&
    "energy_per_serving" in value
  );
}

/**
 * Choose the best available "per serving" nutriments.
 *
 * If the API provided `perServing` we use that.
 * Otherwise, if we have `per100g`, we scale it to the requested serving size.
 */
function getPerServingNutriments(
  nutriments: Nutriments,
  servingSize: number,
): NutrimentsVariant | undefined {
  if (nutriments.perServing) return nutriments.perServing;
  if (!nutriments.per100g) return undefined;

  const per100g = nutriments.per100g;

  if (servingSize === 100) return per100g;

  const scale = servingSize / 100;
  const out: NutrimentsVariant = {};

  if (per100g.energy !== undefined) out.energy = per100g.energy * scale;
  if (per100g.carbohydrates !== undefined)
    out.carbohydrates = per100g.carbohydrates * scale;
  if (per100g.fat !== undefined) out.fat = per100g.fat * scale;
  if (per100g.proteins !== undefined) out.proteins = per100g.proteins * scale;

  return out;
}

/**
 * Convert API product details into our DB row shape.
 *
 * Notes:
 * - `barcode` isn't part of `GetProductDetails`, so this hook can't dedupe by barcode unless
 *   the caller provides a `Food` object or extends the API payload with barcode.
 */
function apiDetailsToFood(
  details: GetProductDetails,
  barcode?: string | null,
): OperatingFood {
  const unit = details.servingsUnit?.trim() || "g";

  // If serving size is missing/invalid, default to 100 so per-100g scaling still makes sense.
  const servingSize =
    details.servingSize === undefined ? 100 : details.servingSize;

  const perServing = getPerServingNutriments(details.nutriments, servingSize);

  const nowMs = Date.now();

  return {
    name: details.name,
    brand: details.brand?.trim() ? details.brand.trim() : null,

    unit,
    serving_size: servingSize,

    // Default to 0 if nutriments are missing.
    energy_per_serving: perServing?.energy ?? 0,
    proteins_per_serving: perServing?.proteins ?? 0,
    carbohydrates_per_serving: perServing?.carbohydrates ?? 0,
    fat_per_serving: perServing?.fat ?? 0,

    barcode: barcode ?? null,
    source: FoodSource.Api,

    created_at: nowMs,
    updated_at: nowMs,
  };
}

export function useUpsertFood(
  data: GetProductDetails | OperatingFood,
  barcode?: string | null,
) {
  const { food: foodRepo } = useRepositories();
  const [foodId, setFoodId] = useState<number | null>(null);

  useEffect(() => {
    // Step 1: Normalize inputs into a single `Food` shape.
    let food: OperatingFood;

    if (isFood(data)) {
      food = data;
    } else {
      food = apiDetailsToFood(data, barcode);
    }

    foodRepo.upsertFood(food).then(setFoodId);
  }, [foodRepo, data, barcode]);

  return foodId;
}
