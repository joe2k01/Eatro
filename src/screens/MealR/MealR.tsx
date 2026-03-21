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
  ProductTrayContent,
  type ProductTrayAcceptResult,
} from "@screens/Product/ProductTray";
import { useUpsertFood } from "@db/hooks/useUpsertFood";
import { MealRSessionSheet } from "./components/MealRSessionSheet";
import { MealRSaveMealForm } from "./components/MealRSaveMealForm";
import { computeSessionTotals } from "./utils";
import type { MealRSessionItem } from "./types";

type MealRModal =
  | { kind: "none" }
  | { kind: "save"; formKey: number }
  | { kind: "add"; barcode: string; product: GetProductDetails }
  | { kind: "edit"; item: MealRSessionItem };

const initialModal: MealRModal = { kind: "none" };

export function MealR() {
  const showSnackbar = useSnackbar();
  const { client } = useApiClient();
  const [locale] = useLocales();
  const queryClient = useQueryClient();

  const [items, setItems] = useState<MealRSessionItem[]>([]);
  const [scanning, setScanning] = useState(true);
  const [modal, setModal] = useState<MealRModal>(initialModal);

  const flowTrayRef = useRef<TrayApi>(null);
  const saveFormKeyRef = useRef(0);

  const totals = useMemo(() => computeSessionTotals(items), [items]);

  const addFoodId = useUpsertFood(
    modal.kind === "add" ? modal.product : null,
    modal.kind === "add" ? modal.barcode : null,
  );

  const shouldPresentFlowTray =
    modal.kind !== "none" && (modal.kind !== "add" || addFoodId !== null);

  useEffect(() => {
    if (!shouldPresentFlowTray) return;
    const id = requestAnimationFrame(() => flowTrayRef.current?.openTray());
    return () => cancelAnimationFrame(id);
  }, [shouldPresentFlowTray, modal]);

  const handleFlowDismiss = useCallback(() => {
    setModal(initialModal);
    setScanning(true);
  }, []);

  const closeFlowTray = useCallback(async () => {
    await flowTrayRef.current?.closeTray();
  }, []);

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

        setModal({ kind: "add", barcode, product: data });
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

  const onNewItemAccepted = useCallback((result: ProductTrayAcceptResult) => {
    setModal((current) => {
      if (current.kind !== "add") return current;
      const { barcode, product } = current;
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
      return current;
    });
  }, []);

  const onEditAccepted = useCallback((result: ProductTrayAcceptResult) => {
    setModal((current) => {
      if (current.kind !== "edit") return current;
      const { item } = current;
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
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
      return current;
    });
  }, []);

  const onEditItem = useCallback((item: MealRSessionItem) => {
    setScanning(false);
    setModal({ kind: "edit", item });
  }, []);

  const onDeleteItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const onMealSaved = useCallback(() => {
    setItems([]);
  }, []);

  const openSaveMealTray = useCallback(() => {
    saveFormKeyRef.current += 1;
    setModal({ kind: "save", formKey: saveFormKeyRef.current });
  }, []);

  const showSessionSheet = modal.kind !== "add" && modal.kind !== "edit";

  const cameraActive = scanning && modal.kind === "none";

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

      <Tray
        ref={flowTrayRef}
        lockDismiss={modal.kind === "save"}
        onDismiss={handleFlowDismiss}
      >
        {modal.kind === "save" ? (
          <MealRSaveMealForm
            key={modal.formKey}
            saveSessionKey={modal.formKey}
            items={items}
            totals={totals}
            onSaved={onMealSaved}
            onRequestClose={closeFlowTray}
          />
        ) : null}
        {modal.kind === "add" && addFoodId !== null ? (
          <ProductTrayContent
            key={`${modal.barcode}-${addFoodId}`}
            foodId={addFoodId}
            name={modal.product.name}
            brand={modal.product.brand}
            nutriments={modal.product.nutriments}
            selectedUnit={
              modal.product.nutriments.per100g ? "per100g" : "perServing"
            }
            servingSize={modal.product.servingSize}
            servingsUnit={modal.product.servingsUnit}
            onAccept={onNewItemAccepted}
            onClose={closeFlowTray}
          />
        ) : null}
        {modal.kind === "edit" ? (
          <ProductTrayContent
            key={modal.item.id}
            foodId={modal.item.foodId}
            name={modal.item.name}
            brand={modal.item.brand}
            nutriments={modal.item.nutriments}
            selectedUnit={modal.item.selectedUnit}
            servingSize={modal.item.servingSize}
            servingsUnit={modal.item.servingsUnit}
            onAccept={onEditAccepted}
            onClose={closeFlowTray}
          />
        ) : null}
      </Tray>
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
