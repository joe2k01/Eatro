import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { GetProductDetails } from "@api/validators/getProductDetails";
import { VStack } from "@components/layout/VStack";
import { Box } from "@components/layout/Box";
import { RemoteImage } from "@components/media/RemoteImage";
import { Heading, Body, Caption, Title } from "@components/typography/Text";
import { HStack } from "@components/layout/HStack";
import { useTheme } from "@contexts/ThemeProvider";
import {
  PillButton,
  type PillButtonProps,
} from "@components/buttons/PillButton";
import { Button } from "@components/buttons/Button";
import { SafeVStack } from "@components/SafeVStack/SafeVStack";
import type { TrayApi } from "@components/layout/Tray";
import { ProductTray } from "./ProductTray";

type NutrimentsUnit = keyof GetProductDetails["nutriments"];

const unitsLabels: Record<NutrimentsUnit, string> = {
  per100g: "100g",
  perServing: "serving",
};

const styles = StyleSheet.create({
  productImage: {
    width: "100%",
    height: "100%",
  },
});

export type ProductContentProps = {
  foodId: number | null;
  name: string;
  brand: string;
  imageUrl?: string;
  imageRatio?: number;
  nutriments: GetProductDetails["nutriments"];
  servingSize?: number;
  servingsUnit?: string;
};

export function ProductContent({
  foodId,
  name,
  brand,
  imageUrl,
  imageRatio,
  nutriments,
  servingSize,
  servingsUnit,
}: ProductContentProps) {
  const [selectedUnit, setSelectedUnit] = useState<
    NutrimentsUnit | undefined
  >();

  useEffect(() => {
    setSelectedUnit(
      Object.keys(nutriments).find(
        (key) => nutriments[key as NutrimentsUnit],
      ) as NutrimentsUnit,
    );
  }, [nutriments]);

  const units = useMemo(() => {
    const res = [] as PillButtonProps<NutrimentsUnit>["options"];

    if (nutriments.per100g) {
      res.push({
        label: unitsLabels["per100g"],
        value: "per100g",
      });
    }

    if (nutriments.perServing) {
      const servingInfo =
        servingsUnit && servingSize
          ? `(${servingSize}${servingsUnit})`
          : undefined;

      res.push({
        label: servingInfo
          ? `${unitsLabels["perServing"]} ${servingInfo}`
          : unitsLabels["perServing"],
        value: "perServing",
      });
    }

    return res;
  }, [nutriments.per100g, nutriments.perServing, servingSize, servingsUnit]);

  const theme = useTheme();

  const tray = useRef<TrayApi>(null);

  const openTray = useCallback(() => {
    tray.current?.openTray();
  }, []);

  return (
    <Box flex={1}>
      <SafeVStack guard="bottom" flex={1} paddingHorizontal={2}>
        <VStack scrollable flex={1} gap={2} width="100%">
          <VStack gap={1}>
            <Heading textAlign="center">{name}</Heading>
            <Caption textAlign="center" color={theme.text.muted}>
              {brand}
            </Caption>
          </VStack>

          {imageUrl && (
            <Box
              width="75%"
              aspectRatio={1}
              alignItems="center"
              alignSelf="center"
            >
              <Box height="100%" aspectRatio={imageRatio}>
                <RemoteImage
                  source={imageUrl}
                  style={styles.productImage}
                  shape="squircle"
                />
              </Box>
            </Box>
          )}

          {selectedUnit && nutriments[selectedUnit] && (
            <VStack>
              <HStack
                justifyContent="space-between"
                alignItems="center"
                borderBottomColor={theme.surface.secondary}
                borderBottomWidth={1}
                paddingVertical={1}
              >
                <Title>Nutrition Facts</Title>
                <PillButton
                  options={units}
                  selected={selectedUnit}
                  onSelect={setSelectedUnit}
                />
              </HStack>

              {Object.entries(nutriments[selectedUnit]).map(([key, value]) => (
                <HStack
                  key={key}
                  justifyContent="space-between"
                  borderBottomColor={theme.surface.secondary}
                  borderBottomWidth={1}
                  paddingVertical={1}
                >
                  <Body textAlign="center">{key}</Body>
                  <Body textAlign="center">{value}</Body>
                </HStack>
              ))}
            </VStack>
          )}
        </VStack>

        <Button variant="primary" onPress={openTray}>
          Add to meal
        </Button>
      </SafeVStack>
      <ProductTray
        trayRef={tray}
        foodId={foodId}
        name={name}
        brand={brand}
        nutriments={nutriments}
        selectedUnit={selectedUnit}
        servingSize={servingSize}
        servingsUnit={servingsUnit}
      />
    </Box>
  );
}
