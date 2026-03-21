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
import { MealRSessionSheet } from "./components/MealRSessionSheet";
import { MealRSaveMealForm } from "./components/MealRSaveMealForm";
import { MealRAddFlow } from "./components/MealRAddFlow";
import { computeSessionTotals } from "./utils";
import type { MealRSessionItem } from "./types";

type MealRModal =
  | { kind: "none" }
  | { kind: "save"; formKey: number }
  | { kind: "add"; barcode: string; product: GetProductDetails }
  | { kind: "edit"; item: MealRSessionItem };

const MODAL_NONE: MealRModal = { kind: "none" };

export function MealR() {
  const showSnackbar = useSnackbar();
  const { client } = useApiClient();
  const [locale] = useLocales();
  const queryClient = useQueryClient();

  const [items, setItems] = useState<MealRSessionItem[]>([]);
  const [scanning, setScanning] = useState(true);
  const [modal, setModal] = useState<MealRModal>(MODAL_NONE);

  const flowTrayRef = useRef<TrayApi>(null);
  const saveFormKeyRef = useRef(0);

  const totals = useMemo(() => computeSessionTotals(items), [items]);

  useEffect(() => {
    if (modal.kind === "none" || modal.kind === "add") return;
    const id = requestAnimationFrame(() => flowTrayRef.current?.openTray());
    return () => cancelAnimationFrame(id);
  }, [modal]);

  const dismissModal = useCallback(() => {
    setModal(MODAL_NONE);
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

  const onAddFlowReady = useCallback(() => {
    flowTrayRef.current?.openTray();
  }, []);

  const onNewItemAccepted = useCallback(
    (result: ProductTrayAcceptResult) => {
      if (modal.kind !== "add") return;

      const { barcode, product } = modal;
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
    },
    [modal],
  );

  const onEditAccepted = useCallback(
    (result: ProductTrayAcceptResult) => {
      if (modal.kind !== "edit") return;

      const editId = modal.item.id;
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
    [modal],
  );

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
        onDismiss={dismissModal}
      >
        {modal.kind === "save" ? (
          <MealRSaveMealForm
            key={modal.formKey}
            items={items}
            totals={totals}
            onSaved={onMealSaved}
            onRequestClose={closeFlowTray}
          />
        ) : null}

        {modal.kind === "add" ? (
          <MealRAddFlow
            key={modal.barcode}
            product={modal.product}
            barcode={modal.barcode}
            onAccept={onNewItemAccepted}
            onClose={closeFlowTray}
            onReady={onAddFlowReady}
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
