import { IconButton } from "@coinbase/cds-mobile/buttons/IconButton";
import { Box, VStack } from "@coinbase/cds-mobile/layout";
import { Text } from "@coinbase/cds-mobile/typography/Text";
import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from "react-native-vision-camera";
import { Overlay } from "./components/Overlay";

export function Scanner() {
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
      codes.forEach((code, i) => {
        console.log(`Code #${i}:`, JSON.stringify(code, null, 2));
      });
    },
  });

  if (!hasPermission || !device) {
    return null;
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
