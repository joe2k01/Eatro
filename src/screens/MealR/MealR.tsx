import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { BarcodeCamera } from "@components/media/BarcodeCamera";
import { useQueryClient } from "@tanstack/react-query";
import { useLocales } from "expo-localization";
import { useApiClient } from "@api/ApiClient";
import type { GetProductDetails } from "@api/validators/getProductDetails";
import type { TrayApi } from "@components/layout/Tray";
import { Tray } from "@components/layout/Tray";
import { SnackbarVariant, useSnackbar } from "@components/feedback";
import {
  ProductTray,
  type ProductTrayAcceptResult,
} from "@screens/Product/ProductTray";
import { MealRSessionSheet } from "./components/MealRSessionSheet";
import { MealRSaveMealForm } from "./components/MealRSaveMealForm";
import { MealRProductTray } from "./components/MealRProductTray";
import { computeSessionTotals } from "./utils";
import type { MealRSessionItem } from "./types";

type PendingScan = {
  barcode: string;
  product: GetProductDetails;
};

export function MealR() {
  const showSnackbar = useSnackbar();
  const { client } = useApiClient();
  const [locale] = useLocales();
  const queryClient = useQueryClient();

  const [items, setItems] = useState<MealRSessionItem[]>([]);
  const [scanning, setScanning] = useState(true);
  const [pendingScan, setPendingScan] = useState<PendingScan | null>(null);
  const [editingItem, setEditingItem] = useState<MealRSessionItem | null>(null);
  const [saveSessionKey, setSaveSessionKey] = useState(0);

  const editTrayRef = useRef<TrayApi>(null);
  const saveTrayRef = useRef<TrayApi>(null);

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

        setPendingScan({ barcode, product: data });
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

  const resumeScanning = useCallback(() => {
    setPendingScan(null);
    setEditingItem(null);
    setScanning(true);
  }, []);

  const onNewItemAccepted = useCallback(
    (result: ProductTrayAcceptResult) => {
      if (!pendingScan) return;

      const { barcode, product } = pendingScan;
      const newItem: MealRSessionItem = {
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
      };

      setItems((prev) => [...prev, newItem]);
      resumeScanning();
    },
    [pendingScan, resumeScanning],
  );

  const onEditAccepted = useCallback(
    (result: ProductTrayAcceptResult) => {
      if (!editingItem) return;

      setItems((prev) =>
        prev.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                quantity: result.servingsValue,
                servingSize: result.servingSizeValue,
                energy: result.energy,
                proteins: result.proteins,
                carbohydrates: result.carbohydrates,
                fat: result.fat,
              }
            : item,
        ),
      );
      resumeScanning();
    },
    [editingItem, resumeScanning],
  );

  const onEditItem = useCallback((item: MealRSessionItem) => {
    setScanning(false);
    setEditingItem(item);
  }, []);

  useEffect(() => {
    if (!editingItem) return;
    const id = requestAnimationFrame(() => editTrayRef.current?.openTray());
    return () => cancelAnimationFrame(id);
  }, [editingItem]);

  const onDeleteItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const onMealSaved = useCallback(() => {
    setItems([]);
  }, []);

  const openSaveMealTray = useCallback(() => {
    setSaveSessionKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (saveSessionKey === 0) return;
    const id = requestAnimationFrame(() => saveTrayRef.current?.openTray());
    return () => cancelAnimationFrame(id);
  }, [saveSessionKey]);

  const closeSaveTray = useCallback(async () => {
    await saveTrayRef.current?.closeTray();
  }, []);

  return (
    <View style={styles.root}>
      <View style={StyleSheet.absoluteFill}>
        <BarcodeCamera
          isActive={scanning}
          onBarcodeScanned={processBarcode}
          style={styles.camera}
        />
      </View>
      <MealRSessionSheet
        items={items}
        totals={totals}
        onEditItem={onEditItem}
        onDeleteItem={onDeleteItem}
        onPressSaveMeal={openSaveMealTray}
        productTrayOpen={pendingScan !== null || editingItem !== null}
      />

      <Tray ref={saveTrayRef} lockDismiss>
        <MealRSaveMealForm
          saveSessionKey={saveSessionKey}
          items={items}
          totals={totals}
          onSaved={onMealSaved}
          onRequestClose={closeSaveTray}
        />
      </Tray>

      {pendingScan && (
        <MealRProductTray
          product={pendingScan.product}
          barcode={pendingScan.barcode}
          onAccept={onNewItemAccepted}
          onDismiss={resumeScanning}
        />
      )}

      {editingItem && (
        <ProductTray
          trayRef={editTrayRef}
          foodId={editingItem.foodId}
          name={editingItem.name}
          brand={editingItem.brand}
          nutriments={editingItem.nutriments}
          selectedUnit={editingItem.selectedUnit}
          servingSize={editingItem.servingSize}
          servingsUnit={editingItem.servingsUnit}
          onAccept={onEditAccepted}
          onDismiss={resumeScanning}
        />
      )}
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
