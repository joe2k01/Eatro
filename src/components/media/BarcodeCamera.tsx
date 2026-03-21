import { StyleSheet, type ViewStyle, type StyleProp } from "react-native";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from "react-native-vision-camera";
import { useIsFocused } from "@react-navigation/native";

type BarcodeCameraProps = {
  isActive: boolean;
  onBarcodeScanned: (barcode: string) => void;
  style?: StyleProp<ViewStyle>;
};

export function BarcodeCamera({
  isActive,
  onBarcodeScanned,
  style,
}: BarcodeCameraProps) {
  const isFocused = useIsFocused();
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
      const value = codes[0].value;
      if (value) onBarcodeScanned(value);
    },
  });

  if (!hasPermission || !device) {
    return null;
  }

  return (
    <Camera
      device={device}
      isActive={isActive && isFocused}
      style={style ?? StyleSheet.absoluteFill}
      codeScanner={codeScanner}
    />
  );
}
