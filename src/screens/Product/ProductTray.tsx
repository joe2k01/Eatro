import {
  useMemo,
  useState,
  type RefObject,
  useCallback,
  useEffect,
} from "react";
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
import { FoodSource, MealType } from "@db/schemas";
import { LogToMealControls } from "./components/LogToMealControls";
import { utcStartOfTodaySeconds } from "@db/utils/utc";
import { useRepositories } from "@db/context/DatabaseProvider";

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
  barcode: string;
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
  customMealType: z.string().optional().default(""),
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

export function ProductTray({
  trayRef,
  barcode,
  name,
  brand,
  nutriments,
  selectedUnit,
  servingSize,
  servingsUnit,
}: ProductTrayProps) {
  const [saving, setSaving] = useState(false);
  const [showLogControls, setShowLogControls] = useState(false);

  const [dayUtcSeconds, setDayUtcSeconds] = useState(() =>
    utcStartOfTodaySeconds(),
  );
  const [mealType, setMealType] = useState<MealType>(MealType.Snack);

  const { food: foodRepo, meal: mealRepo, mealFood: mealFoodRepo } =
    useRepositories();

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

  const { control, watch, reset } = useForm({
    defaultValues: {
      servings: 1,
      servingSize: defaultServingSize || 100,
      servingUnit: unit,
      customMealType: "",
    },
    resolver: zodResolver(productTrayFormSchema),
  });

  useEffect(() => {
    // Keep sensible defaults when switching between per-100g and per-serving views.
    reset((current) => {
      const currentServingSize =
        typeof current.servingSize === "number"
          ? current.servingSize
          : undefined;
      const currentServings =
        typeof current.servings === "number" ? current.servings : undefined;

      return {
        ...current,
        servingUnit: unit,
        servingSize:
          currentServingSize !== undefined && currentServingSize > 0
            ? currentServingSize
            : defaultServingSize || 100,
        servings:
          currentServings !== undefined && currentServings > 0
            ? currentServings
            : 1,
      };
    });
  }, [defaultServingSize, reset, unit]);

  const servingsInput = watch("servings");
  const servingSizeInput = watch("servingSize");

  const servingsValue = useMemo(() => {
    return safeParseOrDefault(servingsInput, nonNegativeNumber, 0);
  }, [servingsInput]);

  const servingSizeValue = useMemo(() => {
    return safeParseOrDefault(servingSizeInput, nonNegativeNumber, 0);
  }, [servingSizeInput]);

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

  const onOpenLogControls = useCallback(() => {
    if (saving) return;
    setShowLogControls(true);
  }, [saving]);

  const onCancelLog = useCallback(() => {
    if (saving) return;
    setShowLogControls(false);
  }, [saving]);

  const customMealType = watch("customMealType") ?? "";

  const onConfirmLog = useCallback(async () => {
    if (!canConfirm) return;
    if (saving) return;

    if (mealType === MealType.Custom && !customMealType?.trim()) {
      // Keep it simple: we just block until they provide a name.
      // (Could also show inline error via RHF if desired.)
      return;
    }

    setSaving(true);

    try {
      const nowMs = Date.now();
      const perServing = computePerServingFromNutriments(
        nutrimentsForCalc,
        servingSizeValue,
      );

      // 1) Upsert the food with the *chosen serving size* so `meal_foods.quantity`
      // can stay as "number of servings".
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

      // 2) Upsert meal + insert meal_foods + increment totals (single tx).
      const normalizedCustomType =
        mealType === MealType.Custom ? customMealType.trim() : null;

      const delta = {
        energy: perServing.energy * servingsValue,
        proteins: perServing.proteins * servingsValue,
        carbohydrates: perServing.carbohydrates * servingsValue,
        fat: perServing.fat * servingsValue,
      };

      const mealId = await mealRepo.upsertMealAndLogFoodTx(
        {
          dayUtcSeconds,
          type: mealType,
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
            unit={unit}
            format={(v) => (v === undefined ? "" : String(v))}
            inTray
            containerStyle={styles.inputContainer}
          />
        </HStack>

        {showLogControls ? (
          <LogToMealControls
            dayUtcSeconds={dayUtcSeconds}
            setDayUtcSeconds={setDayUtcSeconds}
            mealType={mealType}
            setMealType={setMealType}
            saving={saving}
            canConfirm={
              canConfirm &&
              (mealType !== MealType.Custom || !!customMealType.trim())
            }
            control={control}
            onCancel={onCancelLog}
            onConfirm={onConfirmLog}
          />
        ) : (
          <Button
            variant="primary"
            onPress={onOpenLogControls}
            disabled={saving}
          >
            Add to meal
          </Button>
        )}
      </VStack>
    </Tray>
  );
}
