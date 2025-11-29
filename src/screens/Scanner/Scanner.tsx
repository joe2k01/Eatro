import { Box, VStack } from "@coinbase/cds-mobile/layout";
import { Text } from "@coinbase/cds-mobile/typography/Text";
import { useCallback, useState } from "react";
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

export function Scanner() {
  const [previousCode, setPreviousCode] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const { client } = useApiClient();

  const [locale] = useLocales();

  const processBarcode = useCallback(
    async (barcode: string | undefined) => {
      if (!barcode || previousCode === barcode) {
        return;
      }

      setIsLoading(true);

      try {
        const response = await client.getProductDetails(barcode, {
          lc: locale.languageCode ?? "en",
        });
        const data = await response.json();
        console.log(data);

        // Only set previous code if we successfully retrieved data
        setPreviousCode(barcode);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    },
    [client, previousCode, locale],
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
