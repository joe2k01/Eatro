import { useCallback, useEffect, useRef } from "react";
import type { TrayApi } from "@components/layout/Tray";
import {
  ProductTray,
  type ProductTrayAcceptResult,
} from "@screens/Product/ProductTray";
import type { MealRSessionItem } from "../types";
import { useMealRSession } from "../MealRSessionProvider";

export function MealREditFlow() {
  const { flow, updateItem, returnToSession } = useMealRSession();

  if (flow.kind !== "edit") return null;

  return (
    <MealREditFlowInner
      item={flow.item}
      updateItem={updateItem}
      returnToSession={returnToSession}
    />
  );
}

type MealREditFlowInnerProps = {
  item: MealRSessionItem;
  updateItem: ReturnType<typeof useMealRSession>["updateItem"];
  returnToSession: () => void;
};

function MealREditFlowInner({
  item,
  updateItem,
  returnToSession,
}: MealREditFlowInnerProps) {
  const trayRef = useRef<TrayApi>(null);

  useEffect(() => {
    trayRef.current?.openTray();
  }, []);

  const onAccept = useCallback(
    (result: ProductTrayAcceptResult) => {
      updateItem(item.id, {
        quantity: result.servingsValue,
        servingSize: result.servingSizeValue,
        energy: result.energy,
        proteins: result.proteins,
        carbohydrates: result.carbohydrates,
        fat: result.fat,
      });
    },
    [item.id, updateItem],
  );

  return (
    <ProductTray
      trayRef={trayRef}
      foodId={item.foodId}
      name={item.name}
      brand={item.brand}
      nutriments={item.nutriments}
      selectedUnit={item.selectedUnit}
      servingSize={item.servingSize}
      servingsUnit={item.servingsUnit}
      onAccept={onAccept}
      onDismiss={returnToSession}
    />
  );
}
