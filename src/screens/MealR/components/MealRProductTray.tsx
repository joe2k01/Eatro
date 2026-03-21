import { useEffect, useRef } from "react";
import type { GetProductDetails } from "@api/validators/getProductDetails";
import { useUpsertFood } from "@db/hooks/useUpsertFood";
import type { TrayApi } from "@components/layout/Tray";
import {
  ProductTray,
  type ProductTrayAcceptResult,
} from "@screens/Product/ProductTray";

type MealRProductTrayProps = {
  product: GetProductDetails;
  barcode: string;
  onAccept: (result: ProductTrayAcceptResult) => void;
  onDismiss: () => void;
};

export function MealRProductTray({
  product,
  barcode,
  onAccept,
  onDismiss,
}: MealRProductTrayProps) {
  const foodId = useUpsertFood(product, barcode);
  const trayRef = useRef<TrayApi>(null);

  useEffect(() => {
    if (foodId !== null) {
      trayRef.current?.openTray();
    }
  }, [foodId]);

  const selectedUnit = product.nutriments.per100g
    ? ("per100g" as const)
    : ("perServing" as const);

  return (
    <ProductTray
      trayRef={trayRef}
      foodId={foodId}
      name={product.name}
      brand={product.brand}
      nutriments={product.nutriments}
      selectedUnit={selectedUnit}
      servingSize={product.servingSize}
      servingsUnit={product.servingsUnit}
      onAccept={onAccept}
      onDismiss={onDismiss}
    />
  );
}
