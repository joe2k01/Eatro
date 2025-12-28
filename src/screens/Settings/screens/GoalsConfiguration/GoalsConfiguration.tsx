import { SafeVStack } from "@components/SafeVStack";
import { Button } from "@components/buttons/Button";
import { Box } from "@components/layout/Box";
import { HStack } from "@components/layout/HStack";
import { VStack } from "@components/layout/VStack";
import { TextCaption, Title1 } from "@components/typography/Text";
import { useTheme } from "@contexts/ThemeProvider";
import { useStorage } from "@hooks/useStorage";
import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet } from "react-native";
import type {
  NativeStackNavigationOptions,
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import { useStaticNavigationOptions } from "@hooks/useStaticNavigationOptions";
import { DonutChart, useDonut } from "@components/charts";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormInput } from "@components/forms";
import { KeyboardView } from "@components/layout/KeyboardView";
import { SnackbarVariant, useSnackbar } from "@components/feedback";
import { useNavigation } from "@react-navigation/native";
import { SettingsStackParamsList } from "@screens/Settings/routes";
import type { Goals } from "@constants/storage/validators";
import { goalsValidator } from "@constants/storage/validators/goals";

const defaultFormValues: Goals = {
  calories: undefined,
  protein: undefined,
  carbs: undefined,
  fat: undefined,
};

const styles = StyleSheet.create({
  input: {
    textAlign: "center",
  },
});

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
  const showSnackbar = useSnackbar();
  const navigation =
    useNavigation<NativeStackNavigationProp<SettingsStackParamsList>>();
  const { primary, secondary, accent } = useTheme();
  const { data, update } = useStorage("goals", defaultFormValues);
  const [isCaloriesManual, setIsCaloriesManual] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<Goals>({
    defaultValues: defaultFormValues,
    resolver: zodResolver(goalsValidator),
    mode: "onChange",
  });

  useEffect(() => {
    setIsCaloriesManual(data.calories !== undefined);
    reset(data);
  }, [data, reset]);

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

  const applyAutoCalories = useCallback(
    (mMacroCalories: typeof macroCalories) => {
      const nextCalories =
        mMacroCalories.total > 0 ? mMacroCalories.total : undefined;
      setValue("calories", nextCalories, {
        shouldDirty: false,
        shouldValidate: true,
      });
    },
    [setValue],
  );

  useEffect(() => {
    // Auto-update calories from macros unless the user has set a manual target.
    if (!isCaloriesManual) {
      // Macros being edited already marks the form dirty.
      applyAutoCalories(macroCalories);
    }
  }, [applyAutoCalories, isCaloriesManual, macroCalories]);

  const donut = useDonut([
    { key: "protein", value: macroCalories.proteinCalories, color: primary },
    { key: "carbs", value: macroCalories.carbsCalories, color: secondary },
    { key: "fat", value: macroCalories.fatCalories, color: accent },
  ]);

  const onSave = useCallback(
    async (values: Goals) => {
      await update(values);
      showSnackbar({
        message: "Goals saved",
        variant: SnackbarVariant.Success,
      });
      navigation.popToTop();
    },
    [showSnackbar, update, navigation],
  );

  const caloriesValue = watch("calories");
  const onCaloriesBlur = useCallback(() => {
    // Commit manual mode only when leaving the field.
    // If the user cleared the field, return to auto-calculated calories
    // immediately (even if macros didn't change), so dependent UI like the
    // disabled state stays correct.
    if (caloriesValue === undefined) {
      setIsCaloriesManual(false);
      applyAutoCalories(macroCalories);
      return;
    }

    setIsCaloriesManual(true);
  }, [applyAutoCalories, caloriesValue, macroCalories]);

  const invalidCalories =
    macroCalories.total > caloriesNumber || !caloriesNumber;

  return (
    <KeyboardView>
      <SafeVStack paddingHorizontal={2}>
        <VStack paddingBlock={2} gap={2}>
          <VStack gap={1}>
            <Title1>Calorie Goal</Title1>
            <TextCaption>Set your daily target for calorie intake.</TextCaption>
          </VStack>

          <FormInput
            control={control}
            name="calories"
            label="Calories"
            placeholder="2000"
            keyboardType="number-pad"
            unit="kcal"
            parse={parseOptionalInt}
            onBlur={onCaloriesBlur}
          />

          <VStack alignItems="center" gap={1}>
            <DonutChart
              strokeWidth={18}
              total={caloriesNumber}
              donutData={donut}
              width={"75%"}
            />

            <TextCaption color={invalidCalories ? "destructive" : "fg"}>
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
              inputStyle={styles.input}
            />

            <FormInput
              control={control}
              name="carbs"
              label="Carbs"
              placeholder="0"
              keyboardType="number-pad"
              unit="g"
              parse={parseOptionalInt}
              inputStyle={styles.input}
            />

            <FormInput
              control={control}
              name="fat"
              label="Fat"
              placeholder="0"
              keyboardType="number-pad"
              unit="g"
              parse={parseOptionalInt}
              inputStyle={styles.input}
            />
          </HStack>

          <Box paddingTop={1}>
            <Button
              onPress={handleSubmit(onSave)}
              disabled={invalidCalories || isSubmitting}
            >
              Save goals
            </Button>
          </Box>
        </VStack>
      </SafeVStack>
    </KeyboardView>
  );
}
