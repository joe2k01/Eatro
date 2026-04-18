import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { spacing } from "@constants/theme";
import { useNavigation } from "@react-navigation/native";
import { BackArrow } from "@components/navigation/BackArrow";
import { ScreenHeader } from "@components/navigation/ScreenHeader";
import { BarcodeCamera } from "@components/media/BarcodeCamera";

export function Scanner() {
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
    <View style={styles.container}>
      <BarcodeCamera isActive={!barcode} onBarcodeScanned={onBarcodeScanned} />
      <ScreenHeader
        left={<BackArrow canGoBack variant="destructive" />}
        style={styles.transparentHeader}
      />
    </View>
  );
}

export type ScannerParams = undefined;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  transparentHeader: {
    backgroundColor: "transparent",
    paddingHorizontal: spacing(2),
  },
});
