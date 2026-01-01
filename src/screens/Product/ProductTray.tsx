import { useMemo, type RefObject } from "react";
import { useForm } from "react-hook-form";
import { Tray, type TrayApi } from "@components/layout/Tray";
import { VStack } from "@components/layout/VStack";
import { HStack } from "@components/layout/HStack";
import { Headline, TextBody, TextCaption } from "@components/typography/Text";
import { Button } from "@components/buttons/Button";
import { FormInput } from "@components/forms";
import type { GetProductDetails } from "@api/validators/getProductDetails";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { StyleSheet } from "react-native";
import { nonNegativeNumber } from "@constants/storage/validators/numberParsers";
import { safeParseOrDefault } from "@constants/storage/validators/safeParseOrDefault";

type NutrimentsUnit = keyof GetProductDetails["nutriments"];

const inputToNumber = z.coerce.number().nonnegative().optional().default(0);
const inputQuantity = z
  .number()
  .or(z.string().transform((s) => inputToNumber.parse(s)));

function roundTo(n: number, decimals: number): number {
  const p = 10 ** decimals;
  return Math.round(n * p) / p;
}

function formatNutrientValue(key: string, value: number): string {
  if (key === "energy") return String(Math.round(value));
  return String(roundTo(value, 1));
}

const styles = StyleSheet.create({
  inputContainer: {
    maxWidth: "33%",
  },
});

export type ProductTrayProps = {
  trayRef: RefObject<TrayApi | null>;
  name: string;
  brand: string;
  nutriments: GetProductDetails["nutriments"];
  selectedUnit?: NutrimentsUnit;
  servingSize?: number;
  servingsUnit?: string;
};

const productTrayFormSchema = z.object({
  servings: inputQuantity,
  servingSize: inputQuantity,
  servingUnit: z.string(),
});

export function ProductTray({
  trayRef,
  name,
  brand,
  nutriments,
  selectedUnit,
  servingSize,
  servingsUnit,
}: ProductTrayProps) {
  const defaultServingSize = useMemo(() => {
    if (selectedUnit === "per100g") return 100;
    if (servingSize !== undefined) return servingSize;

    return 0;
  }, [selectedUnit, servingSize]);

  const unit = useMemo(
    () => (selectedUnit === "per100g" ? "g" : (servingsUnit ?? "")),
    [selectedUnit, servingsUnit],
  );

  const nutrimentsForCalc = useMemo(() => {
    if (nutriments.per100g) {
      return {
        ...nutriments.per100g,
        base: 100,
      };
    }

    return {
      ...nutriments.perServing,
      base: servingSize ?? 1,
    };
  }, [nutriments.per100g, nutriments.perServing, servingSize]);

  const { control, watch } = useForm({
    defaultValues: {
      servings: 1,
      servingSize: defaultServingSize,
      servingUnit: unit,
    },
    resolver: zodResolver(productTrayFormSchema),
  });

  const servingsInput = watch("servings");
  const servingSizeInput = watch("servingSize");

  const computedNutriments = useMemo(() => {
    const {
      base,
      carbohydrates = 0,
      fat = 0,
      protein = 0,
      energy = 0,
    } = nutrimentsForCalc;

    const servingsValue = safeParseOrDefault(
      servingsInput,
      nonNegativeNumber,
      0,
    );
    const servingSizeValue = safeParseOrDefault(
      servingSizeInput,
      nonNegativeNumber,
      0,
    );

    return {
      carbohydrates: (carbohydrates * servingsValue * servingSizeValue) / base,
      fat: (fat * servingsValue * servingSizeValue) / base,
      protein: (protein * servingsValue * servingSizeValue) / base,
      energy: (energy * servingsValue * servingSizeValue) / base,
    };
  }, [nutrimentsForCalc, servingSizeInput, servingsInput]);

  return (
    <Tray ref={trayRef}>
      <VStack gap={2} backgroundColor="transparent">
        <VStack backgroundColor="transparent">
          <Headline>{name}</Headline>
          <TextCaption color="fgMuted">{brand}</TextCaption>
        </VStack>

        {computedNutriments && (
          <HStack
            backgroundColor="transparent"
            justifyContent="space-between"
            flex={1}
          >
            {Object.entries(computedNutriments).map(([key, value]) => (
              <VStack key={key} backgroundColor="transparent" flex={1}>
                <TextBody textAlign="center">
                  {typeof value === "number"
                    ? formatNutrientValue(key, value)
                    : String(value)}
                </TextBody>
                <TextCaption textAlign="center">{key}</TextCaption>
              </VStack>
            ))}
          </HStack>
        )}

        <HStack
          backgroundColor="transparent"
          justifyContent="space-between"
          alignItems="center"
        >
          <TextBody>Number of servings</TextBody>
          <FormInput
            control={control}
            name="servings"
            placeholder="1"
            keyboardType="decimal-pad"
            format={(v) => (v === undefined ? "" : String(v))}
            inTray
            containerStyle={styles.inputContainer}
          />
        </HStack>

        <HStack
          backgroundColor="transparent"
          justifyContent="space-between"
          alignItems="center"
        >
          <TextBody>Serving size</TextBody>
          <FormInput
            control={control}
            name="servingSize"
            placeholder={String(defaultServingSize)}
            keyboardType="decimal-pad"
            unit="g"
            format={(v) => (v === undefined ? "" : String(v))}
            inTray
            containerStyle={styles.inputContainer}
          />
        </HStack>

        <Button variant="primary" onPress={() => trayRef.current?.closeTray()}>
          Add to meal
        </Button>
      </VStack>
    </Tray>
  );
}
