import { useCallback, useEffect, useRef } from "react";
import type { GetProductDetails } from "@api/validators/getProductDetails";
import type { TrayApi } from "@components/layout/Tray";
import { Tray } from "@components/layout/Tray";
import {
  ProductTrayContent,
  type ProductTrayAcceptResult,
} from "@screens/Product/ProductTray";
import type { MealRSessionItem, MealRSessionTotals } from "../types";
import { MealRSaveMealForm } from "./MealRSaveMealForm";
import { MealRAddFlow } from "./MealRAddFlow";

export type MealRFlow =
  | { kind: "none" }
  | { kind: "save"; formKey: number }
  | { kind: "add"; barcode: string; product: GetProductDetails }
  | { kind: "edit"; item: MealRSessionItem };

type MealRTrayProps = {
  flow: MealRFlow;
  items: MealRSessionItem[];
  totals: MealRSessionTotals;
  onNewItemAccepted: (result: ProductTrayAcceptResult) => void;
  onEditAccepted: (result: ProductTrayAcceptResult) => void;
  onMealSaved: () => void;
  onDismiss: () => void;
};

export function MealRTray({
  flow,
  items,
  totals,
  onNewItemAccepted,
  onEditAccepted,
  onMealSaved,
  onDismiss,
}: MealRTrayProps) {
  const trayRef = useRef<TrayApi>(null);

  useEffect(() => {
    if (flow.kind === "none" || flow.kind === "add") return;
    const id = requestAnimationFrame(() => trayRef.current?.openTray());
    return () => cancelAnimationFrame(id);
  }, [flow]);

  const onAddFlowReady = useCallback(() => {
    trayRef.current?.openTray();
  }, []);

  const closeTray = useCallback(async () => {
    await trayRef.current?.closeTray();
  }, []);

  function renderContent() {
    switch (flow.kind) {
      case "save":
        return (
          <MealRSaveMealForm
            key={flow.formKey}
            items={items}
            totals={totals}
            onSaved={onMealSaved}
            onRequestClose={closeTray}
          />
        );
      case "add":
        return (
          <MealRAddFlow
            key={flow.barcode}
            product={flow.product}
            barcode={flow.barcode}
            onAccept={onNewItemAccepted}
            onClose={closeTray}
            onReady={onAddFlowReady}
          />
        );
      case "edit":
        return (
          <ProductTrayContent
            key={flow.item.id}
            foodId={flow.item.foodId}
            name={flow.item.name}
            brand={flow.item.brand}
            nutriments={flow.item.nutriments}
            selectedUnit={flow.item.selectedUnit}
            servingSize={flow.item.servingSize}
            servingsUnit={flow.item.servingsUnit}
            onAccept={onEditAccepted}
            onClose={closeTray}
          />
        );
      case "none":
        return null;
    }
  }

  return (
    <Tray
      ref={trayRef}
      lockDismiss={flow.kind === "save"}
      onDismiss={onDismiss}
    >
      {renderContent()}
    </Tray>
  );
}
