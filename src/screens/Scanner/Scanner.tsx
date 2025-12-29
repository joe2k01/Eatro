import { useCallback, useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from "react-native-vision-camera";
import { useNavigation } from "@react-navigation/native";
import { useStaticNavigationOptions } from "@hooks/useStaticNavigationOptions";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { BackArrow } from "@components/navigation/BackArrow";

const scannerHeaderOptions = {
  title: "",
  headerStyle: {
    backgroundColor: "transparent",
  },
  headerLeft: (props) => <BackArrow {...props} variant="destructive" />,
} satisfies NativeStackNavigationOptions;

export function Scanner() {
  useStaticNavigationOptions(scannerHeaderOptions);
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
    <Camera
      device={device}
      isActive={!barcode}
      style={StyleSheet.absoluteFill}
      codeScanner={codeScanner}
    />
  );
}

export type ScannerParams = undefined;
