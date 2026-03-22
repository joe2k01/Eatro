import { useCallback, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { BarcodeCamera } from "@components/media/BarcodeCamera";
import { useQueryClient } from "@tanstack/react-query";
import { useLocales } from "expo-localization";
import { useApiClient } from "@api/ApiClient";
import { SnackbarVariant, useSnackbar } from "@components/feedback";
import { MealRSessionSheet } from "./components/MealRSessionSheet";
import { MealRAddFlow } from "./components/MealRAddFlow";
import { MealREditFlow } from "./components/MealREditFlow";
import { MealRSaveMealForm } from "./components/MealRSaveMealForm";
import { MealRSessionProvider, useMealRSession } from "./MealRSessionProvider";

function MealRContent() {
  const { flow, scanning, setFlow } = useMealRSession();
  const showSnackbar = useSnackbar();
  const { client } = useApiClient();
  const [locale] = useLocales();
  const queryClient = useQueryClient();

  const processBarcode = useCallback(
    async (barcode: string) => {
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
      }
    },
    [client, locale.languageCode, queryClient, setFlow, showSnackbar],
  );

  const content = useMemo(() => {
    switch (flow.kind) {
      case "session":
        return <MealRSessionSheet />;
      case "add":
        return <MealRAddFlow />;
      case "edit":
        return <MealREditFlow />;
      case "save":
        return <MealRSaveMealForm />;
    }
  }, [flow]);

  const cameraActive = scanning && flow.kind === "session";

  return (
    <View style={styles.root}>
      <View style={StyleSheet.absoluteFill}>
        <BarcodeCamera
          isActive={cameraActive}
          onBarcodeScanned={processBarcode}
          style={styles.camera}
        />
      </View>

      {content}
    </View>
  );
}

export function MealR() {
  return (
    <MealRSessionProvider>
      <MealRContent />
    </MealRSessionProvider>
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
