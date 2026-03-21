import { useMemo, useState, type RefObject, useCallback } from "react";
import { useForm } from "@hooks/useForm";
import { Tray, type TrayApi } from "@components/layout/Tray";
import { VStack } from "@components/layout/VStack";
import { HStack } from "@components/layout/HStack";
import { Heading, Body, Caption } from "@components/typography/Text";
import { useTheme } from "@contexts/ThemeProvider";
import { Button } from "@components/buttons/Button";
import { TextInput, Picker } from "@components/forms";
import type { GetProductDetails } from "@api/validators/getProductDetails";
import { z } from "zod";
import { StyleSheet } from "react-native";
import { MealType } from "@db/schemas";
import { utcStartOfTodaySeconds, addUtcDaysSeconds } from "@db/utils/utc";
import { useRepositories } from "@db/context/DatabaseProvider";
import { IconButton } from "@components/buttons/IconButton";
import { PopupButtonOption } from "../../../modules/popup-button";
import { parseNumber } from "../../utils/numberFormat";
import { useTextInput } from "@components/forms/hooks/useTextInput";
import { SnackbarVariant, useSnackbar } from "@components/feedback";

type NutrimentsUnit = keyof GetProductDetails["nutriments"];

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
    width: "33%",
  },
});

export type ProductTrayAcceptResult = {
  foodId: number;
  servingsValue: number;
  servingSizeValue: number;
  energy: number;
  proteins: number;
  carbohydrates: number;
  fat: number;
};

export type ProductTrayProps = {
  trayRef: RefObject<TrayApi | null>;
  foodId: number | null;
  name: string;
  brand: string;
  nutriments: GetProductDetails["nutriments"];
  selectedUnit?: NutrimentsUnit;
  servingSize?: number;
  servingsUnit?: string;
  onAccept?: (result: ProductTrayAcceptResult) => void;
  onDismiss?: () => void;
};

const productTrayFormSchema = z.object({
  servings: z.number().nonnegative().optional(),
  servingSize: z.number().nonnegative().optional(),
  servingUnit: z.string(),
  customMealType: z.string(),
});

type ProductTrayFormValues = z.infer<typeof productTrayFormSchema>;

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
  foodId,
  name,
  brand,
  nutriments,
  selectedUnit,
  servingSize,
  servingsUnit,
  onAccept,
  onDismiss,
}: ProductTrayProps) {
  const theme = useTheme();
  const showSnackbar = useSnackbar();
  const [saving, setSaving] = useState(false);

  const [dayUtcSeconds, setDayUtcSeconds] = useState(() =>
    utcStartOfTodaySeconds(),
  );
  const [mealType, setMealType] = useState<
    (typeof mealOptions)[number] | undefined
  >(undefined);

  const { meal: mealRepo, mealFood: mealFoodRepo } = useRepositories();

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

  const { values, setValue } = useForm<
    ProductTrayFormValues,
    typeof productTrayFormSchema
  >({
    initialValues: {
      servings: 1,
      servingSize: defaultServingSize || 100,
      servingUnit: unit,
      customMealType: "",
    },
    schema: productTrayFormSchema,
  });

  const [servingsValue, setServingsValue] = useState(1);
  const [servingSizeValue, setServingSizeValue] = useState(
    defaultServingSize ?? 100,
  );

  const updateServingsValue = useCallback((text: string) => {
    const num = parseNumber(text);
    setServingsValue(num ?? 0);
  }, []);

  const updateServingSizeValue = useCallback((text: string) => {
    const num = parseNumber(text);
    setServingSizeValue(num ?? 0);
  }, []);

  const { value: servingsValueText, onChange: setServingsValueText } =
    useTextInput({
      defaultValue: "1",
      onChange: updateServingsValue,
    });

  const { value: servingSizeValueText, onChange: setServingSizeValueText } =
    useTextInput({
      defaultValue: String(defaultServingSize ?? 100),
      onChange: updateServingSizeValue,
    });

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
    if (!canConfirm || saving || foodId === null) return;

    setSaving(true);

    try {
      const perServing = computePerServingFromNutriments(
        nutrimentsForCalc,
        servingSizeValue,
      );

      const normalizedCustomType =
        mealType?.value === MealType.Custom ? customMealType.trim() : null;

      const delta = {
        energy: perServing.energy * servingsValue,
        proteins: perServing.proteins * servingsValue,
        carbohydrates: perServing.carbohydrates * servingsValue,
        fat: perServing.fat * servingsValue,
      };

      const nowMs = Date.now();
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

      if (mealId === null) {
        throw new Error("Failed to log meal, please try again");
      }

      await trayRef.current?.closeTray();

      showSnackbar({
        message: "Meal logged successfully",
        variant: SnackbarVariant.Success,
      });
    } catch (error) {
      showSnackbar({
        message:
          error instanceof Error
            ? error.message
            : "Failed to log meal, please try again",
        variant: SnackbarVariant.Error,
      });
    } finally {
      setSaving(false);
    }
  }, [
    canConfirm,
    customMealType,
    dayUtcSeconds,
    foodId,
    mealFoodRepo,
    mealRepo,
    mealType,
    nutrimentsForCalc,
    saving,
    servingSizeValue,
    servingsValue,
    showSnackbar,
    trayRef,
  ]);

  const onConfirmAccept = useCallback(async () => {
    if (!canConfirm || foodId === null || !onAccept) return;

    onAccept({
      foodId,
      servingsValue,
      servingSizeValue,
      energy: computedNutriments.energy,
      proteins: computedNutriments.proteins,
      carbohydrates: computedNutriments.carbohydrates,
      fat: computedNutriments.fat,
    });

    await trayRef.current?.closeTray();
  }, [
    canConfirm,
    computedNutriments,
    foodId,
    onAccept,
    servingSizeValue,
    servingsValue,
    trayRef,
  ]);

  const inputRowStyle = useMemo(
    () => ({ backgroundColor: theme.surface.tertiary }),
    [theme.surface.tertiary],
  );

  return (
    <Tray ref={trayRef} onDismiss={onDismiss}>
      <VStack gap={2} backgroundColor="transparent">
        <VStack backgroundColor="transparent">
          <Heading>{name}</Heading>
          <Caption color={theme.text.muted}>{brand}</Caption>
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
            value={servingsValueText}
            onChangeText={setServingsValueText}
            placeholder="1"
            keyboardType="decimal-pad"
            containerStyle={styles.inputContainer}
            inputRowStyle={inputRowStyle}
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
            value={servingSizeValueText}
            onChangeText={setServingSizeValueText}
            placeholder={String(defaultServingSize)}
            keyboardType="decimal-pad"
            unit={unit}
            containerStyle={styles.inputContainer}
            inputRowStyle={inputRowStyle}
            inBottomSheet
          />
        </HStack>

        {onAccept ? (
          <Button
            variant="primary"
            onPress={onConfirmAccept}
            disabled={!canConfirm}
          >
            Add to meal
          </Button>
        ) : (
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
              <Picker
                options={mealOptions}
                onOptionSelect={setMealType}
                variant="primary"
                inverted
              />
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
        )}
      </VStack>
    </Tray>
  );
}
