import { SafeVStack } from "@components/SafeVStack";
import { Button } from "@components/buttons/Button";
import { Box } from "@components/layout/Box";
import { HStack } from "@components/layout/HStack";
import { VStack } from "@components/layout/VStack";
import { TextCaption, Title1 } from "@components/typography/Text";
import { useTheme } from "@contexts/ThemeProvider";
import { useStorage } from "@hooks/useStorage";
import { useThemeDimension } from "@hooks/useThemeDimension";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { KeyboardAvoidingView, StyleSheet } from "react-native";
import { z } from "zod";
import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { useStaticNavigationOptions } from "@hooks/useStaticNavigationOptions";
import { DonutChart } from "./components/DonutChart";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormInput } from "@components/forms";

const goalsSchema = z
  .object({
    calories: z.number().int().nonnegative(),
    protein: z.number().int().nonnegative(),
    carbs: z.number().int().nonnegative(),
    fat: z.number().int().nonnegative(),
  })
  .partial();

type GoalsFormValues = z.infer<typeof goalsSchema>;

const defaultFormValues: GoalsFormValues = {
  calories: undefined,
  protein: undefined,
  carbs: undefined,
  fat: undefined,
};

function parseOptionalInt(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const n = Number(trimmed);
  if (!Number.isFinite(n)) return undefined;
  return Math.max(0, Math.trunc(n));
}

export const goalsConfigurationHeaderOptions = {
  title: "Goals configuration",
} satisfies NativeStackNavigationOptions;

export function GoalsConfiguration() {
  useStaticNavigationOptions(goalsConfigurationHeaderOptions);
  const { popover, fgPopover, muted, primary, secondary, accent, destructive } =
    useTheme();
  const { data, storageApi } = useStorage("goals", goalsSchema);
  const caloriesManuallyEditedRef = useRef(false);

  const { control, handleSubmit, reset, setValue, watch } =
    useForm<GoalsFormValues>({
      defaultValues: defaultFormValues,
      resolver: zodResolver(goalsSchema),
      mode: "onChange",
    });

  useEffect(() => {
    storageApi.current?.load();
  }, [storageApi]);

  useEffect(() => {
    const mData = data as GoalsFormValues;
    caloriesManuallyEditedRef.current = false;
    reset({
      calories: typeof mData.calories === "number" ? mData.calories : undefined,
      protein: typeof mData.protein === "number" ? mData.protein : undefined,
      carbs: typeof mData.carbs === "number" ? mData.carbs : undefined,
      fat: typeof mData.fat === "number" ? mData.fat : undefined,
    });
  }, [data, reset]);

  const borderRadius = useThemeDimension(0.5);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        input: {
          backgroundColor: popover,
          color: fgPopover,
          borderRadius,
          paddingHorizontal: 12,
          paddingVertical: 10,
          fontSize: 16,
        },
        inputCentered: {
          textAlign: "center",
        },
      }),
    [borderRadius, fgPopover, popover],
  );

  const caloriesNumber = watch("calories") ?? 0;
  const proteinNumber = watch("protein") ?? 0;
  const carbsNumber = watch("carbs") ?? 0;
  const fatNumber = watch("fat") ?? 0;

  const macroCalories = useMemo(() => {
    const proteinCalories = proteinNumber * 4;
    const carbsCalories = carbsNumber * 4;
    const fatCalories = fatNumber * 9;
    return {
      proteinCalories,
      carbsCalories,
      fatCalories,
      total: proteinCalories + carbsCalories + fatCalories,
    };
  }, [carbsNumber, fatNumber, proteinNumber]);

  useEffect(() => {
    // Auto-update calories when the user edits macros, but don't override a
    // manually-edited calorie target.
    if (caloriesManuallyEditedRef.current) {
      return;
    }

    const nextCalories =
      macroCalories.total > 0 ? macroCalories.total : undefined;

    setValue("calories", nextCalories, {
      // Macros being edited already marks the form dirty.
      shouldDirty: false,
      shouldValidate: true,
    });
  }, [macroCalories.total, setValue]);

  const donutSegments = useMemo(() => {
    const total = Math.max(caloriesNumber, macroCalories.total, 1);
    const remainder = Math.max(0, total - macroCalories.total);
    const isOverTarget =
      caloriesNumber > 0 && macroCalories.total > caloriesNumber;

    return {
      total,
      remainder,
      isOverTarget,
      segments: [
        {
          key: "protein",
          value: macroCalories.proteinCalories,
          color: primary,
        },
        { key: "carbs", value: macroCalories.carbsCalories, color: secondary },
        { key: "fat", value: macroCalories.fatCalories, color: accent },
        {
          key: "remainder",
          value: remainder,
          color: isOverTarget ? destructive : muted,
        },
      ],
    };
  }, [
    accent,
    caloriesNumber,
    destructive,
    macroCalories,
    muted,
    primary,
    secondary,
  ]);

  const onSave = useCallback(
    async (values: GoalsFormValues) => {
      await storageApi.current?.store(values);
    },
    [storageApi],
  );

  const onCaloriesChange = useCallback(() => {
    caloriesManuallyEditedRef.current = true;
  }, []);

  return (
    <SafeVStack paddingHorizontal={2}>
      <KeyboardAvoidingView behavior={"position"} keyboardVerticalOffset={100}>
        <VStack paddingBlock={2} gap={2}>
          <VStack gap={1}>
            <Title1>Calorie Goal</Title1>
            <TextCaption>Set your daily target for calorie intake.</TextCaption>
          </VStack>

          <FormInput
            control={control}
            name="calories"
            label="Calories"
            placeholder="e.g. 2200"
            keyboardType="number-pad"
            unit="kcal"
            parse={parseOptionalInt}
            onTextChange={onCaloriesChange}
          />

          <VStack alignItems="center" gap={1}>
            <DonutChart
              size={220}
              strokeWidth={18}
              gapDegrees={7}
              backgroundColor={popover}
              segments={donutSegments.segments}
            />

            <TextCaption>
              Macros: {macroCalories.total} kcal{" "}
              {caloriesNumber > 0 ? `(target ${caloriesNumber} kcal)` : ""}
            </TextCaption>
          </VStack>

          <VStack gap={1}>
            <Title1>Macronutrient Goals (grams)</Title1>
            <TextCaption>Set daily macro targets in grams.</TextCaption>
          </VStack>

          <HStack gap={1}>
            <FormInput
              control={control}
              name="protein"
              label="Protein"
              placeholder="0"
              keyboardType="number-pad"
              unit="g"
              parse={parseOptionalInt}
              inputStyle={styles.inputCentered}
            />

            <FormInput
              control={control}
              name="carbs"
              label="Carbs"
              placeholder="0"
              keyboardType="number-pad"
              unit="g"
              parse={parseOptionalInt}
              inputStyle={styles.inputCentered}
            />

            <FormInput
              control={control}
              name="fat"
              label="Fat"
              placeholder="0"
              keyboardType="number-pad"
              unit="g"
              parse={parseOptionalInt}
              inputStyle={styles.inputCentered}
            />
          </HStack>

          <Box paddingTop={1}>
            <Button onPress={handleSubmit(onSave)}>Save goals</Button>
          </Box>
        </VStack>
      </KeyboardAvoidingView>
    </SafeVStack>
  );
}
