import { useCallback, useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from "react-native-vision-camera";
import { useQueryClient } from "@tanstack/react-query";
import { useLocales } from "expo-localization";
import { useApiClient } from "@api/ApiClient";
import type { GetProductDetails } from "@api/validators/getProductDetails";
import type { TrayApi } from "@components/layout/Tray";
import { VStack } from "@components/layout/VStack";
import { useTheme } from "@contexts/ThemeProvider";
import { SnackbarVariant, useSnackbar } from "@components/feedback";
import { useStaticNavigationOptions } from "@hooks/useStaticNavigationOptions";
import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { spacing } from "@constants/theme";
import { Title } from "@components/typography/Text";
import {
  ProductTray,
  type ProductTrayAcceptResult,
} from "@screens/Product/ProductTray";
import { MealRDrawer } from "./components/MealRDrawer";
import { MealRFinishBar } from "./components/MealRFinishBar";
import { MealRProductTray } from "./components/MealRProductTray";
import { computeSessionTotals } from "./utils";
import type { MealRSessionItem } from "./types";

const headerOptions = {
  headerTitle: () => <Title>MealR</Title>,
  headerTransparent: true,
} satisfies NativeStackNavigationOptions;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  drawer: {
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1.5),
  },
});

type PendingScan = {
  barcode: string;
  product: GetProductDetails;
};

export function MealR() {
  useStaticNavigationOptions(headerOptions);
  const theme = useTheme();
  const showSnackbar = useSnackbar();
  const { client } = useApiClient();
  const [locale] = useLocales();
  const queryClient = useQueryClient();

  const [items, setItems] = useState<MealRSessionItem[]>([]);
  const [scanning, setScanning] = useState(true);
  const [pendingScan, setPendingScan] = useState<PendingScan | null>(null);
  const [editingItem, setEditingItem] = useState<MealRSessionItem | null>(null);

  const editTrayRef = useRef<TrayApi>(null);

  const totals = useMemo(() => computeSessionTotals(items), [items]);

  const processBarcode = useCallback(
    async (barcode: string | undefined) => {
      if (!barcode) return;

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
    setTimeout(() => editTrayRef.current?.openTray(), 100);
  }, []);

  const onDeleteItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const onMealSaved = useCallback(() => {
    setItems([]);
  }, []);

  const { hasPermission } = useCameraPermission();
  const device = useCameraDevice("back");

  const codeScanner = useCodeScanner({
    codeTypes: [
      "ean-13",
      "ean-8",
      "code-128",
      "code-39",
      "code-93",
      "gs1-data-bar",
      "gs1-data-bar-expanded",
      "gs1-data-bar-limited",
      "codabar",
      "itf",
      "itf-14",
      "upc-a",
      "upc-e",
      "pdf-417",
    ],
    onCodeScanned: (codes) => {
      if (!codes.length) return;
      processBarcode(codes[0].value);
    },
  });

  if (!hasPermission || !device) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Camera
        device={device}
        isActive={scanning}
        style={styles.camera}
        codeScanner={codeScanner}
      />
      <VStack style={styles.drawer} backgroundColor={theme.surface.secondary}>
        <MealRDrawer
          items={items}
          totals={totals}
          onEditItem={onEditItem}
          onDeleteItem={onDeleteItem}
        />
        <MealRFinishBar items={items} totals={totals} onSaved={onMealSaved} />
      </VStack>

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

export type MealRParams = undefined;
