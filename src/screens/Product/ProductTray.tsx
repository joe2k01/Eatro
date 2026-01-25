import {
  useMemo,
  useState,
  type RefObject,
  useCallback,
  useEffect,
} from "react";
import { useForm } from "@hooks/useForm";
import { Tray, type TrayApi } from "@components/layout/Tray";
import { VStack } from "@components/layout/VStack";
import { HStack } from "@components/layout/HStack";
import { Heading, Body, Caption } from "@components/typography/Text";
import { Button } from "@components/buttons/Button";
import { TextInput, Picker } from "@components/forms";
import type { GetProductDetails } from "@api/validators/getProductDetails";
import { z } from "zod";
import { StyleSheet } from "react-native";
import { nonNegativeNumber } from "@constants/storage/validators/numberParsers";
import { safeParseOrDefault } from "@constants/storage/validators/safeParseOrDefault";
import { FoodSource, MealType } from "@db/schemas";
import { utcStartOfTodaySeconds, addUtcDaysSeconds } from "@db/utils/utc";
import { useRepositories } from "@db/context/DatabaseProvider";
import { IconButton } from "@components/buttons/IconButton";
import { PopupButtonOption } from "../../../modules/popup-button";

type NutrimentsUnit = keyof GetProductDetails["nutriments"];

function roundTo(n: number, decimals: number): number {
  const p = 10 ** decimals;
  return Math.round(n * p) / p;
}

import { formatNumber, parseNumber } from "@utils/numberFormat";

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
  barcode: string;
  name: string;
  brand: string;
  nutriments: GetProductDetails["nutriments"];
  selectedUnit?: NutrimentsUnit;
  servingSize?: number;
  servingsUnit?: string;
  hideLogControls?: boolean;
};

const productTrayFormSchema = z.object({
  servings: z.number().nonnegative().optional(),
  servingSize: z.number().nonnegative().optional(),
  servingUnit: z.string(),
  customMealType: z.string().optional(),
});

type NutrimentsForCalc = {
  base: number;
  carbohydrates?: number;
  fat?: number;
  proteins?: number;
  energy?: number;
};

function computePerServingFromNutriments(
  nutrimentsForCalc: NutrimentsForCalc,
  servingSize: number,
) {
  const {
    base,
    carbohydrates = 0,
    fat = 0,
    proteins = 0,
    energy = 0,
  } = nutrimentsForCalc;

  return {
    carbohydrates: (carbohydrates * servingSize) / base,
    fat: (fat * servingSize) / base,
    proteins: (proteins * servingSize) / base,
    energy: (energy * servingSize) / base,
  };
}

const mealOptions: PopupButtonOption<MealType>[] = [
  { label: "Breakfast", value: MealType.Breakfast },
  { label: "Lunch", value: MealType.Lunch },
  { label: "Dinner", value: MealType.Dinner },
  { label: "Snack", value: MealType.Snack },
  { label: "Custom", value: MealType.Custom },
];

export function ProductTray({
  trayRef,
  barcode,
  name,
  brand,
  nutriments,
  selectedUnit,
  servingSize,
  servingsUnit,
  hideLogControls = false,
}: ProductTrayProps) {
  const [saving, setSaving] = useState(false);

  const [dayUtcSeconds, setDayUtcSeconds] = useState(() =>
    utcStartOfTodaySeconds(),
  );
  const [mealType, setMealType] = useState<
    (typeof mealOptions)[number] | undefined
  >(undefined);

  const {
    food: foodRepo,
    meal: mealRepo,
    mealFood: mealFoodRepo,
  } = useRepositories();

  const defaultServingSize = useMemo(() => {
    if (selectedUnit === "per100g") return 100;
    if (servingSize !== undefined) return servingSize;
    return 0;
  }, [selectedUnit, servingSize]);

  const unit = useMemo(
    () => (selectedUnit === "per100g" ? "g" : (servingsUnit ?? "")),
    [selectedUnit, servingsUnit],
  );

  const nutrimentsForCalc: NutrimentsForCalc = useMemo(() => {
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

  const { values, setValue, setValues } = useForm({
    initialValues: {
      servings: 1,
      servingSize: defaultServingSize || 100,
      servingUnit: unit,
      customMealType: "",
    },
    schema: productTrayFormSchema,
  });

  useEffect(() => {
    // Keep sensible defaults when switching between per-100g and per-serving views.
    setValues({
      servingUnit: unit,
      servingSize:
        values.servingSize !== undefined && values.servingSize > 0
          ? values.servingSize
          : defaultServingSize || 100,
      servings:
        values.servings !== undefined && values.servings > 0
          ? values.servings
          : 1,
    });
  }, [defaultServingSize, setValues, unit, values.servingSize, values.servings]);

  const servingsValue = useMemo(() => {
    return safeParseOrDefault(values.servings, nonNegativeNumber, 0);
  }, [values.servings]);

  const servingSizeValue = useMemo(() => {
    return safeParseOrDefault(values.servingSize, nonNegativeNumber, 0);
  }, [values.servingSize]);

  const computedNutriments = useMemo(() => {
    const {
      base,
      carbohydrates = 0,
      fat = 0,
      proteins = 0,
      energy = 0,
    } = nutrimentsForCalc;

    return {
      carbohydrates: (carbohydrates * servingsValue * servingSizeValue) / base,
      fat: (fat * servingsValue * servingSizeValue) / base,
      proteins: (proteins * servingsValue * servingSizeValue) / base,
      energy: (energy * servingsValue * servingSizeValue) / base,
    };
  }, [nutrimentsForCalc, servingSizeValue, servingsValue]);

  const canConfirm = servingsValue > 0 && servingSizeValue > 0 && !saving;

  const customMealType = values.customMealType ?? "";

  const dayLabel = useMemo(() => {
    return new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(new Date(dayUtcSeconds * 1000));
  }, [dayUtcSeconds]);

  const onConfirmLog = useCallback(async () => {
    if (!canConfirm) return;
    if (saving) return;

    if (mealType?.value === MealType.Custom && !customMealType?.trim()) {
      return;
    }

    setSaving(true);

    try {
      const nowMs = Date.now();
      const perServing = computePerServingFromNutriments(
        nutrimentsForCalc,
        servingSizeValue,
      );

      const foodId = await foodRepo.upsertFood({
        name,
        brand: brand?.trim() ? brand.trim() : null,
        unit,
        serving_size: servingSizeValue,
        energy_per_serving: perServing.energy,
        proteins_per_serving: perServing.proteins,
        carbohydrates_per_serving: perServing.carbohydrates,
        fat_per_serving: perServing.fat,
        barcode,
        source: FoodSource.Api,
        created_at: nowMs,
        updated_at: nowMs,
      });

      if (!foodId) {
        throw new Error("Failed to upsert food");
      }

      const normalizedCustomType =
        mealType?.value === MealType.Custom ? customMealType.trim() : null;

      const delta = {
        energy: perServing.energy * servingsValue,
        proteins: perServing.proteins * servingsValue,
        carbohydrates: perServing.carbohydrates * servingsValue,
        fat: perServing.fat * servingsValue,
      };

      const mealId = await mealRepo.upsertMealAndLogFoodTx(
        {
          dayUtcSeconds,
          type: mealType?.value ?? MealType.Snack,
          customType: normalizedCustomType,
          foodId,
          quantityServings: servingsValue,
          delta,
          nowMs,
        },
        mealFoodRepo,
      );

      if (!mealId) {
        throw new Error("Failed to upsert meal");
      }

      trayRef.current?.closeTray();
    } finally {
      setSaving(false);
    }
  }, [
    barcode,
    brand,
    canConfirm,
    customMealType,
    dayUtcSeconds,
    foodRepo,
    mealFoodRepo,
    mealRepo,
    mealType,
    name,
    nutrimentsForCalc,
    saving,
    servingSizeValue,
    servingsValue,
    trayRef,
    unit,
  ]);

  return (
    <Tray ref={trayRef}>
      <VStack gap={2} backgroundColor="transparent">
        <VStack backgroundColor="transparent">
          <Heading>{name}</Heading>
          <Caption color="fgMuted">{brand}</Caption>
        </VStack>

        {computedNutriments && (
          <HStack
            backgroundColor="transparent"
            justifyContent="space-between"
            flex={1}
          >
            {Object.entries(computedNutriments).map(([key, value]) => (
              <VStack key={key} backgroundColor="transparent" flex={1}>
                <Body textAlign="center">
                  {typeof value === "number"
                    ? formatNutrientValue(key, value)
                    : String(value)}
                </Body>
                <Caption textAlign="center">{key}</Caption>
              </VStack>
            ))}
          </HStack>
        )}

        <HStack
          backgroundColor="transparent"
          justifyContent="space-between"
          alignItems="center"
        >
          <Body>Number of servings</Body>
          <TextInput
            value={formatNumber(values.servings)}
            onChangeText={(text) => setValue("servings", parseNumber(text))}
            placeholder="1"
            keyboardType="decimal-pad"
            containerStyle={styles.inputContainer}
            inBottomSheet
          />
        </HStack>

        <HStack
          backgroundColor="transparent"
          justifyContent="space-between"
          alignItems="center"
        >
          <Body>Serving size</Body>
          <TextInput
            value={formatNumber(values.servingSize)}
            onChangeText={(text) => setValue("servingSize", parseNumber(text))}
            placeholder={String(defaultServingSize)}
            keyboardType="decimal-pad"
            unit={unit}
            containerStyle={styles.inputContainer}
            inBottomSheet
          />
        </HStack>

        {!hideLogControls ? (
          <VStack gap={2} backgroundColor="transparent">
            <HStack
              backgroundColor="transparent"
              justifyContent="space-between"
              alignItems="center"
            >
              <Body>Day</Body>
              <HStack backgroundColor="transparent" alignItems="center" gap={1}>
                <IconButton
                  name="chevron-left"
                  variant="tertiary"
                  onPress={() =>
                    setDayUtcSeconds((d) => addUtcDaysSeconds(d, -1))
                  }
                  disabled={saving}
                />
                <Body>{dayLabel}</Body>
                <IconButton
                  name="chevron-right"
                  variant="tertiary"
                  onPress={() =>
                    setDayUtcSeconds((d) => addUtcDaysSeconds(d, 1))
                  }
                  disabled={saving}
                />
              </HStack>
            </HStack>

            <HStack
              backgroundColor="transparent"
              gap={3}
              alignItems="center"
              justifyContent="space-between"
            >
              <Body>Meal</Body>
              <Picker options={mealOptions} onOptionSelect={setMealType} />
            </HStack>

            {mealType?.value === MealType.Custom ? (
              <TextInput
                value={values.customMealType ?? ""}
                onChangeText={(text) => setValue("customMealType", text)}
                placeholder="e.g. Post-workout"
                inBottomSheet
              />
            ) : null}

            <Button
              variant="primary"
              onPress={onConfirmLog}
              disabled={
                !canConfirm ||
                (mealType?.value === MealType.Custom && !customMealType.trim())
              }
            >
              Confirm
            </Button>
          </VStack>
        ) : null}
      </VStack>
    </Tray>
  );
}
