import { useCallback, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { BarcodeCamera } from "@components/media/BarcodeCamera";
import { useQueryClient } from "@tanstack/react-query";
import { useLocales } from "expo-localization";
import { useApiClient } from "@api/ApiClient";
import { SnackbarVariant, useSnackbar } from "@components/feedback";
import type { ProductTrayAcceptResult } from "@screens/Product/ProductTray";
import { MealRSessionSheet } from "./components/MealRSessionSheet";
import { MealRTray, type MealRFlow } from "./components/MealRTray";
import { computeSessionTotals } from "./utils";
import type { MealRSessionItem } from "./types";

const FLOW_NONE: MealRFlow = { kind: "none" };

export function MealR() {
  const showSnackbar = useSnackbar();
  const { client } = useApiClient();
  const [locale] = useLocales();
  const queryClient = useQueryClient();

  const [items, setItems] = useState<MealRSessionItem[]>([]);
  const [scanning, setScanning] = useState(true);
  const [flow, setFlow] = useState<MealRFlow>(FLOW_NONE);

  const totals = useMemo(() => computeSessionTotals(items), [items]);

  const processBarcode = useCallback(
    async (barcode: string) => {
      setScanning(false);

      try {
        const data = await queryClient.fetchQuery({
          queryKey: ["product", barcode, locale.languageCode ?? "en"],
          queryFn: () =>
            client.getProductDetails(barcode, {
              lc: locale.languageCode ?? "en",
            }),
        });

        setFlow({ kind: "add", barcode, product: data });
      } catch {
        showSnackbar({
          message: "Could not load product. Try again.",
          variant: SnackbarVariant.Error,
        });
        setScanning(true);
      }
    },
    [client, locale.languageCode, queryClient, showSnackbar],
  );

  const onNewItemAccepted = useCallback(
    (result: ProductTrayAcceptResult) => {
      if (flow.kind !== "add") return;

      const { barcode, product } = flow;
      setItems((prev) => [
        ...prev,
        {
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
        },
      ]);
    },
    [flow],
  );

  const onEditAccepted = useCallback(
    (result: ProductTrayAcceptResult) => {
      if (flow.kind !== "edit") return;

      const editId = flow.item.id;
      setItems((prev) =>
        prev.map((i) =>
          i.id === editId
            ? {
                ...i,
                quantity: result.servingsValue,
                servingSize: result.servingSizeValue,
                energy: result.energy,
                proteins: result.proteins,
                carbohydrates: result.carbohydrates,
                fat: result.fat,
              }
            : i,
        ),
      );
    },
    [flow],
  );

  const onEditItem = useCallback((item: MealRSessionItem) => {
    setScanning(false);
    setFlow({ kind: "edit", item });
  }, []);

  const onDeleteItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const onMealSaved = useCallback(() => {
    setItems([]);
  }, []);

  const openSaveMealTray = useCallback(() => {
    setFlow({ kind: "save", formKey: Date.now() });
  }, []);

  const dismissFlow = useCallback(() => {
    setFlow(FLOW_NONE);
    setScanning(true);
  }, []);

  const showSessionSheet = flow.kind !== "add" && flow.kind !== "edit";
  const cameraActive = scanning && flow.kind === "none";

  return (
    <View style={styles.root}>
      <View style={StyleSheet.absoluteFill}>
        <BarcodeCamera
          isActive={cameraActive}
          onBarcodeScanned={processBarcode}
          style={styles.camera}
        />
      </View>

      {showSessionSheet ? (
        <MealRSessionSheet
          items={items}
          totals={totals}
          onEditItem={onEditItem}
          onDeleteItem={onDeleteItem}
          onPressSaveMeal={openSaveMealTray}
        />
      ) : null}

      <MealRTray
        flow={flow}
        items={items}
        totals={totals}
        onNewItemAccepted={onNewItemAccepted}
        onEditAccepted={onEditAccepted}
        onMealSaved={onMealSaved}
        onDismiss={dismissFlow}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
});

export type MealRParams = undefined;
