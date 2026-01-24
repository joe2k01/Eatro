import {
  QueryErrorResetBoundary,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useLocales } from "expo-localization";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useApiClient } from "@api/ApiClient";
import { useParams } from "@hooks/useParams";
import { GetProductDetails } from "@api/validators/getProductDetails";
import { VStack } from "@components/layout/VStack";
import { Box } from "@components/layout/Box";
import { RemoteImage } from "@components/media/RemoteImage";
import {
  Headline,
  TextBody,
  TextCaption,
  Title1,
} from "@components/typography/Text";
import { ErrorBoundary } from "@components/feedback";
import { ProductLoader } from "./ProductLoader";
import { ProductError } from "./ProductError";
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
import { useUpsertFood } from "@db/hooks/useUpsertFood";

type NutrimentsUnit = keyof GetProductDetails["nutriments"];

const unitsLabels: Record<NutrimentsUnit, string> = {
  per100g: "100g",
  perServing: "serving",
};

function ProductContent({ barcode }: { barcode: string }) {
  const [locale] = useLocales();
  const { client } = useApiClient();

  const { data } = useSuspenseQuery({
    queryKey: ["product", barcode, locale.languageCode ?? "en"],
    queryFn: () =>
      client.getProductDetails(barcode, {
        lc: locale.languageCode ?? "en",
      }),
  });

  useUpsertFood(data, barcode);

  const {
    brand,
    name,
    imageUrl,
    imageRatio,
    nutriments,
    servingSize,
    servingsUnit,
  } = data;

  const [selectedUnit, setSelectedUnit] = useState<
    NutrimentsUnit | undefined
  >();

  useEffect(() => {
    // Some foods might not have either per100g or perServing, so we need to find the first one that exists.
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

  const { card } = useTheme();

  const tray = useRef<TrayApi>(null);

  return (
    <Box flex={1}>
      <SafeVStack guard="bottom" flex={1} paddingHorizontal={2}>
        {/* Scroll area takes remaining space above the fixed bottom button */}
        <VStack scrollable flex={1} gap={2} width="100%">
          <VStack gap={1}>
            <Headline textAlign="center">{name}</Headline>
            <TextCaption textAlign="center" color="fgMuted">
              {brand}
            </TextCaption>
          </VStack>

          <Box
            width="75%"
            aspectRatio={1}
            alignItems="center"
            alignSelf="center"
          >
            <Box height="100%" aspectRatio={imageRatio}>
              <RemoteImage
                source={imageUrl}
                width="100%"
                height="100%"
                shape="squircle"
              />
            </Box>
          </Box>

          {selectedUnit && nutriments[selectedUnit] && (
            <VStack>
              <HStack
                justifyContent="space-between"
                alignItems="center"
                borderBottomColor={card}
                borderBottomWidth={1}
                paddingVertical={1}
              >
                <Title1>Nutrition Facts</Title1>
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
                  borderBottomColor={card}
                  borderBottomWidth={1}
                  paddingVertical={1}
                >
                  <TextBody textAlign="center">{key}</TextBody>
                  <TextBody textAlign="center">{value}</TextBody>
                </HStack>
              ))}
            </VStack>
          )}
        </VStack>

        {/* Fixed bottom action (always visible) */}
        <Button variant="primary" onPress={() => tray.current?.openTray()}>
          Add to meal
        </Button>
      </SafeVStack>
      <ProductTray
        trayRef={tray}
        barcode={barcode}
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

export function Product() {
  const { barcode } = useParams<ProductParams>();

  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallback={({ error, reset: onRetry }) => (
            <ProductError error={error} onRetry={onRetry} />
          )}
        >
          <Suspense fallback={<ProductLoader />}>
            <ProductContent barcode={barcode} />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}

export type ProductParams = { barcode: string };
export type ProductDetails = GetProductDetails;
