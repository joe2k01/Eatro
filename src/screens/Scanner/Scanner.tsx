import { useCallback, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useStaticNavigationOptions } from "@hooks/useStaticNavigationOptions";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { BackArrow } from "@components/navigation/BackArrow";
import { BarcodeCamera } from "@components/media/BarcodeCamera";

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
    function listener() {
      setBarcode(undefined);
    }

    navigation.addListener("focus", listener);

    return () => navigation.removeListener("focus", listener);
  }, [navigation]);

  const onBarcodeScanned = useCallback(
    (value: string) => {
      setBarcode(value);
      navigation.navigate("Product", { barcode: value });
    },
    [navigation],
  );

  return (
    <BarcodeCamera isActive={!barcode} onBarcodeScanned={onBarcodeScanned} />
  );
}

export type ScannerParams = undefined;
