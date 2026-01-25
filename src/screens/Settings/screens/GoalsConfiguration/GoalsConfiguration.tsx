import { SafeVStack } from "@components/SafeVStack";
import { Button } from "@components/buttons/Button";
import { Box } from "@components/layout/Box";
import { HStack } from "@components/layout/HStack";
import { VStack } from "@components/layout/VStack";
import { Caption, Title } from "@components/typography/Text";
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
import { useForm } from "@hooks/useForm";
import { TextInput } from "@components/forms";
import { SnackbarVariant, useSnackbar } from "@components/feedback";
import { useNavigation } from "@react-navigation/native";
import { SettingsStackParamsList } from "@screens/Settings/routes";
import { goalsValidator } from "@constants/storage/validators/goals";
import { safeParseOrDefault } from "@constants/storage/validators/safeParseOrDefault";
import { nonNegativeNumber } from "@constants/storage/validators/numberParsers";
import { formatNumber, parseNumber } from "../../../../utils/numberFormat";

const styles = StyleSheet.create({
  input: {
    textAlign: "center",
  },
  inputContainer: {
    flex: 1,
  },
});

export const goalsConfigurationHeaderOptions = {
  title: "Goals configuration",
} satisfies NativeStackNavigationOptions;

export function GoalsConfiguration() {
  useStaticNavigationOptions(goalsConfigurationHeaderOptions);
  const showSnackbar = useSnackbar();
  const navigation =
    useNavigation<NativeStackNavigationProp<SettingsStackParamsList>>();
  const theme = useTheme();
  const { data, update } = useStorage("goals", {
    calories: undefined,
    protein: undefined,
    carbs: undefined,
    fat: undefined,
  });
  const [isCaloriesManual, setIsCaloriesManual] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { values, errors, setValue, setValues, validate } = useForm({
    initialValues: data,
    schema: goalsValidator,
  });

  useEffect(() => {
    setIsCaloriesManual(data.calories !== undefined);
    setValues(data);
  }, [data, setValues]);

  const macroCalories = useMemo(() => {
    const proteinNumber = safeParseOrDefault(
      values.protein,
      nonNegativeNumber,
      0,
    );
    const carbsNumber = safeParseOrDefault(values.carbs, nonNegativeNumber, 0);
    const fatNumber = safeParseOrDefault(values.fat, nonNegativeNumber, 0);

    return {
      protein: proteinNumber * 4,
      carbs: carbsNumber * 4,
      fat: fatNumber * 9,
      total: proteinNumber * 4 + carbsNumber * 4 + fatNumber * 9,
    };
  }, [values.carbs, values.fat, values.protein]);

  const applyAutoCalories = useCallback(
    (mMacroCalories: typeof macroCalories) => {
      const nextCalories =
        mMacroCalories.total > 0 ? mMacroCalories.total : undefined;
      setValue("calories", nextCalories);
    },
    [setValue],
  );

  const caloriesNumber = useMemo(
    () => safeParseOrDefault(values.calories, nonNegativeNumber, 0),
    [values.calories],
  );

  useEffect(() => {
    if (!isCaloriesManual) {
      applyAutoCalories(macroCalories);
    }
  }, [applyAutoCalories, isCaloriesManual, macroCalories]);

  const donut = useDonut([
    {
      key: "protein",
      value: macroCalories.protein,
      color: theme.semantic.primary,
    },
    {
      key: "carbs",
      value: macroCalories.carbs,
      color: theme.semantic.secondary,
    },
    { key: "fat", value: macroCalories.fat, color: theme.semantic.accent },
  ]);

  const onSave = useCallback(async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await update(values);
      showSnackbar({
        message: "Goals saved",
        variant: SnackbarVariant.Success,
      });
      navigation.popToTop();
    } finally {
      setIsSubmitting(false);
    }
  }, [validate, values, showSnackbar, update, navigation]);

  const onCaloriesBlur = useCallback(() => {
    if (values.calories === undefined) {
      setIsCaloriesManual(false);
      applyAutoCalories(macroCalories);
      return;
    }
    setIsCaloriesManual(true);
  }, [applyAutoCalories, values.calories, macroCalories]);

  const invalidCalories =
    macroCalories.total > caloriesNumber || !caloriesNumber;

  return (
    <SafeVStack paddingHorizontal={2}>
      <VStack paddingBlock={2} gap={2}>
        <VStack gap={1}>
          <Title>Calorie Goal</Title>
          <Caption>Set your daily target for calorie intake.</Caption>
        </VStack>

        <TextInput
          label="Calories"
          value={formatNumber(values.calories)}
          onChangeText={(text) => setValue("calories", parseNumber(text))}
          onBlur={onCaloriesBlur}
          placeholder="2000"
          keyboardType="number-pad"
          unit="kcal"
          error={errors.calories}
        />

        <VStack alignItems="center" gap={1}>
          <DonutChart
            strokeWidth={18}
            total={caloriesNumber}
            donutData={donut}
            width={"75%"}
          />

          <Caption
            color={
              invalidCalories ? theme.semantic.destructive : theme.text.primary
            }
          >
            Macros: {macroCalories.total} kcal{" "}
            {caloriesNumber > 0 ? `(target ${caloriesNumber} kcal)` : ""}
          </Caption>
        </VStack>

        <VStack gap={1}>
          <Title>Macronutrient Goals (grams)</Title>
          <Caption>Set daily macro targets in grams.</Caption>
        </VStack>

        <HStack gap={1}>
          <TextInput
            label="Protein"
            value={formatNumber(values.protein)}
            onChangeText={(text) => setValue("protein", parseNumber(text))}
            placeholder="0"
            keyboardType="number-pad"
            unit="g"
            inputStyle={styles.input}
            containerStyle={styles.inputContainer}
            error={errors.protein}
          />

          <TextInput
            label="Carbs"
            value={formatNumber(values.carbs)}
            onChangeText={(text) => setValue("carbs", parseNumber(text))}
            placeholder="0"
            keyboardType="number-pad"
            unit="g"
            inputStyle={styles.input}
            containerStyle={styles.inputContainer}
            error={errors.carbs}
          />

          <TextInput
            label="Fat"
            value={formatNumber(values.fat)}
            onChangeText={(text) => setValue("fat", parseNumber(text))}
            placeholder="0"
            keyboardType="number-pad"
            unit="g"
            inputStyle={styles.input}
            containerStyle={styles.inputContainer}
            error={errors.fat}
          />
        </HStack>

        <Box paddingTop={1}>
          <Button onPress={onSave} disabled={invalidCalories || isSubmitting}>
            Save goals
          </Button>
        </Box>
      </VStack>
    </SafeVStack>
  );
}
