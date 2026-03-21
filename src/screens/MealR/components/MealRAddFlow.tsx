import { useEffect } from "react";
import type { GetProductDetails } from "@api/validators/getProductDetails";
import { useUpsertFood } from "@db/hooks/useUpsertFood";
import {
  ProductTrayContent,
  type ProductTrayAcceptResult,
} from "@screens/Product/ProductTray";

type MealRAddFlowProps = {
  product: GetProductDetails;
  barcode: string;
  onAccept: (result: ProductTrayAcceptResult) => void;
  onClose: () => Promise<void>;
  onReady: () => void;
};

export function MealRAddFlow({
  product,
  barcode,
  onAccept,
  onClose,
  onReady,
}: MealRAddFlowProps) {
  const foodId = useUpsertFood(product, barcode);

  useEffect(() => {
    if (foodId !== null) onReady();
  }, [foodId, onReady]);

  if (foodId === null) return null;

  return (
    <ProductTrayContent
      foodId={foodId}
      name={product.name}
      brand={product.brand}
      nutriments={product.nutriments}
      selectedUnit={product.nutriments.per100g ? "per100g" : "perServing"}
      servingSize={product.servingSize}
      servingsUnit={product.servingsUnit}
      onAccept={onAccept}
      onClose={onClose}
    />
  );
}
