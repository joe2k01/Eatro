import { Box, VStack } from "@coinbase/cds-mobile/layout";
import { Text } from "@coinbase/cds-mobile/typography/Text";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from "react-native-vision-camera";
import { Overlay } from "./components/Overlay";
import { useApiClient } from "../../api/ApiClient";
import { useLocales } from "expo-localization";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";

export function Scanner() {
  const navigation = useNavigation();
  const [locale] = useLocales();

  const [barcode, setBarcode] = useState<string | undefined>();
  const { client } = useApiClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["product", barcode],
    queryFn: async ({ queryKey }) => {
      const [_, mBarcode] = queryKey;
      console.log("Calling with", mBarcode);
      return client.getProductDetails(mBarcode ?? "", {
        lc: locale.languageCode ?? "en",
      });
    },
    enabled: !!barcode,
  });

  useEffect(() => {
    function listener() {
      setBarcode(undefined);
    }

    navigation.addListener("focus", listener);

    return () => navigation.removeListener("focus", listener);
  }, [navigation]);

  const processBarcode = useCallback(
    async (barcode: string | undefined) => {
      if (!barcode || isLoading) {
        return;
      }

      setBarcode(barcode);
    },
    [isLoading],
  );

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
      if (!codes.length) {
        return;
      }

      processBarcode(codes[0].value);
    },
  });

  useEffect(() => {
    if (data) {
      navigation.navigate("Product", data);
    }
  }, [data, navigation]);

  if (!hasPermission || !device) {
    return null;
  }

  if (isLoading) {
    return (
      <VStack height="100%" alignItems="center">
        <Text>Loading</Text>
      </VStack>
    );
  }

  return (
    <Box position="relative" width="100%" height="100%">
      <Camera
        device={device}
        isActive
        style={StyleSheet.absoluteFill}
        codeScanner={codeScanner}
      />
      <SafeAreaProvider>
        <Overlay />
      </SafeAreaProvider>
    </Box>
  );
}

export type ScannerParams = undefined;
