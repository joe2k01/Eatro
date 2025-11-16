import { StyleSheet } from "react-native";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from "react-native-vision-camera";

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
    <Camera
      device={device}
      isActive
      style={StyleSheet.absoluteFill}
      codeScanner={codeScanner}
    />
  );
}

export type ScannerParams = undefined;
