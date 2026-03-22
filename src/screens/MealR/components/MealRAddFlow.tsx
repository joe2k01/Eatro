import { useCallback, useEffect, useRef } from "react";
import { useUpsertFood } from "@db/hooks/useUpsertFood";
import type { TrayApi } from "@components/layout/Tray";
import { Tray } from "@components/layout/Tray";
import {
  ProductTrayContent,
  type ProductTrayAcceptResult,
} from "@screens/Product/ProductTray";
import { useMealRSession } from "../MealRSessionProvider";

export function MealRAddFlow() {
  const { flow, addItem, returnToSession } = useMealRSession();

  if (flow.kind !== "add") return null;

  return (
    <MealRAddFlowInner
      barcode={flow.barcode}
      product={flow.product}
      addItem={addItem}
      returnToSession={returnToSession}
    />
  );
}

type MealRAddFlowInnerProps = {
  barcode: string;
  product: Parameters<typeof useUpsertFood>[0];
  addItem: ReturnType<typeof useMealRSession>["addItem"];
  returnToSession: () => void;
};

function MealRAddFlowInner({
  barcode,
  product,
  addItem,
  returnToSession,
}: MealRAddFlowInnerProps) {
  const foodId = useUpsertFood(product, barcode);
  const trayRef = useRef<TrayApi>(null);

  useEffect(() => {
    if (foodId !== null) {
      trayRef.current?.openTray();
    }
  }, [foodId]);

  const closeTray = useCallback(async () => {
    await trayRef.current?.closeTray();
  }, []);

  const onAccept = useCallback(
    (result: ProductTrayAcceptResult) => {
      addItem({
        id: `${barcode}-${Date.now()}`,
        foodId: result.foodId,
        name: product.name,
        brand: product.brand,
        nutriments: product.nutriments,
        selectedUnit: product.nutriments.per100g ? "per100g" : "perServing",
        servingSize: result.servingSizeValue,
        servingsUnit: product.servingsUnit,
        quantity: result.servingsValue,
        energy: result.energy,
        proteins: result.proteins,
        carbohydrates: result.carbohydrates,
        fat: result.fat,
      });
    },
    [addItem, barcode, product],
  );

  if (foodId === null) return null;

  return (
    <Tray ref={trayRef} onDismiss={returnToSession}>
      <ProductTrayContent
        foodId={foodId}
        name={product.name}
        brand={product.brand}
        nutriments={product.nutriments}
        selectedUnit={product.nutriments.per100g ? "per100g" : "perServing"}
        servingSize={product.servingSize}
        servingsUnit={product.servingsUnit}
        onAccept={onAccept}
        onClose={closeTray}
      />
    </Tray>
  );
}
