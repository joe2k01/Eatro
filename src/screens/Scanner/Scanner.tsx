import { Box } from "@coinbase/cds-mobile/layout";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from "react-native-vision-camera";
import { Overlay } from "./components/Overlay";
import { useNavigation } from "@react-navigation/native";

export function Scanner() {
  const navigation = useNavigation();

  const [barcode, setBarcode] = useState<string | undefined>();

  useEffect(() => {
    // Clear barcode on view resume
    function listener() {
      setBarcode(undefined);
    }

    navigation.addListener("focus", listener);

    return () => navigation.removeListener("focus", listener);
  }, [navigation]);

  const processBarcode = useCallback(
    async (barcode: string | undefined) => {
      if (!barcode) {
        return;
      }

      setBarcode(barcode);
      navigation.navigate("ProductLoader", { barcode });
    },
    [navigation],
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

  return (
    <Box position="relative" width="100%" height="100%">
      <Camera
        device={device}
        isActive={!barcode}
        style={StyleSheet.absoluteFill}
        codeScanner={codeScanner}
      />
      <Overlay />
    </Box>
  );
}

export type ScannerParams = undefined;
