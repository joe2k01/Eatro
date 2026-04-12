import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { z } from "zod";
import { SafeVStack } from "@components/SafeVStack";
import { VStack } from "@components/layout/VStack";
import { HStack } from "@components/layout/HStack";
import { Box } from "@components/layout/Box";
import { ScreenHeader } from "@components/navigation/ScreenHeader";
import { Caption } from "@components/typography/Text";
import { TextInput, Picker } from "@components/forms";
import { Button } from "@components/buttons/Button";
import { Icon } from "@components/media/Icon";
import { SnackbarVariant, useSnackbar } from "@components/feedback";
import { useTheme } from "@contexts/ThemeProvider";
import { useForm } from "@hooks/useForm";
import { useRepositories } from "@db/context/DatabaseProvider";
import { FoodSource } from "@db/schemas";
import { formatNumber, parseNumber } from "../../utils/numberFormat";
import type { PopupButtonOption } from "../../../modules/popup-button";

const createFoodSchema = z.object({
  name: z.string().min(1, "Name is required"),
  servingSize: z.number({ error: "Required" }).positive("Must be positive"),
  unit: z.string().min(1, "Unit is required"),
  energy: z.number({ error: "Required" }).nonnegative("Must be non-negative"),
  protein: z.number({ error: "Required" }).nonnegative("Must be non-negative"),
  carbs: z.number({ error: "Required" }).nonnegative("Must be non-negative"),
  fat: z.number({ error: "Required" }).nonnegative("Must be non-negative"),
  brand: z.string().optional(),
  barcode: z.string().optional(),
});

type CreateFoodValues = z.infer<typeof createFoodSchema>;

export type NutrientBasis = "per100g" | "perServing";

const nutrientBasisOptions: PopupButtonOption<NutrientBasis>[] = [
  { label: "Per 100g", value: "per100g" },
  { label: "Per serving", value: "perServing" },
];

const unitOptions: PopupButtonOption<string>[] = [
  { label: "g", value: "g" },
  { label: "ml", value: "ml" },
  { label: "oz", value: "oz" },
  { label: "cup", value: "cup" },
  { label: "piece", value: "piece" },
  { label: "slice", value: "slice" },
  { label: "scoop", value: "scoop" },
  { label: "tbsp", value: "tbsp" },
];

const styles = StyleSheet.create({
  inputContainer: {
    flex: 1,
  },
  servingRow: {
    alignItems: "flex-start",
  },
  servingField: {
    flex: 1,
  },
  servingUnitField: {
    flex: 1,
    gap: 4,
  },
  servingUnitLabel: {
    minHeight: 20,
  },
  macroInput: {
    textAlign: "center",
  },
  moreDetailsToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});

export function CreateFood() {
  const theme = useTheme();
  const showSnackbar = useSnackbar();
  const navigation = useNavigation();
  const { food: foodRepo } = useRepositories();
  const [submitting, setSubmitting] = useState(false);
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [nutrientBasis, setNutrientBasis] =
    useState<NutrientBasis>("perServing");

  const { values, errors, setValue, validate } = useForm<
    CreateFoodValues,
    typeof createFoodSchema
  >({
    initialValues: {
      name: undefined as unknown as string,
      servingSize: undefined as unknown as number,
      unit: "g",
      energy: undefined as unknown as number,
      protein: undefined as unknown as number,
      carbs: undefined as unknown as number,
      fat: undefined as unknown as number,
      brand: undefined,
      barcode: undefined,
    },
    schema: createFoodSchema,
  });

  const nutritionLabel = useMemo(() => {
    if (nutrientBasis === "per100g") return "Nutrition per 100g";
    const size = values.servingSize;
    const unit = values.unit || "g";
    return size ? `Nutrition per ${size}${unit}` : "Nutrition per serving";
  }, [nutrientBasis, values.servingSize, values.unit]);

  const onChangeByField = useMemo(
    () =>
      ({
        name: (text: string) => setValue("name", text),
        servingSize: (text: string) =>
          setValue("servingSize", parseNumber(text) ?? 0),
        energy: (text: string) => setValue("energy", parseNumber(text) ?? 0),
        protein: (text: string) => setValue("protein", parseNumber(text) ?? 0),
        carbs: (text: string) => setValue("carbs", parseNumber(text) ?? 0),
        fat: (text: string) => setValue("fat", parseNumber(text) ?? 0),
        brand: (text: string) => setValue("brand", text),
        barcode: (text: string) => setValue("barcode", text),
      }) as const,
    [setValue],
  );

  const onSave = useCallback(async () => {
    if (!validate()) return;

    setSubmitting(true);
    try {
      const nowMs = Date.now();
      const isPer100g = nutrientBasis === "per100g";
      const foodId = await foodRepo.upsertFood({
        name: values.name!.trim(),
        brand: values.brand?.trim() || null,
        unit: isPer100g ? "g" : values.unit!,
        serving_size: isPer100g ? 100 : values.servingSize!,
        energy_per_serving: values.energy!,
        proteins_per_serving: values.protein!,
        carbohydrates_per_serving: values.carbs!,
        fat_per_serving: values.fat!,
        barcode: values.barcode?.trim() || null,
        source: FoodSource.Manual,
        created_at: nowMs,
        updated_at: nowMs,
      });

      if (foodId === null) {
        showSnackbar({
          message: "A food with this name and brand already exists",
          variant: SnackbarVariant.Error,
        });
        return;
      }

      showSnackbar({
        message: "Food created",
        variant: SnackbarVariant.Success,
      });
      navigation.goBack();
    } finally {
      setSubmitting(false);
    }
  }, [validate, values, nutrientBasis, foodRepo, showSnackbar, navigation]);

  return (
    <SafeVStack guard="bottom" paddingHorizontal={2}>
      <ScreenHeader title="New Food" style={{ paddingHorizontal: 0 }} />
      <VStack scrollable paddingBlock={2} gap={2}>
        <TextInput
          label="Name"
          value={values.name ?? ""}
          onChangeText={onChangeByField.name}
          placeholder="e.g. Grilled Chicken"
          error={errors.name}
        />

        <Picker
          options={nutrientBasisOptions}
          onOptionSelect={(opt) => {
            setNutrientBasis(opt.value);
            if (opt.value === "per100g") {
              setValue("servingSize", 100);
              setValue("unit", "g");
            }
          }}
          placeholder={nutrientBasis === "per100g" ? "Per 100g" : "Per serving"}
        />

        {nutrientBasis === "perServing" && (
          <HStack gap={1} style={styles.servingRow}>
            <TextInput
              label="Serving size"
              value={formatNumber(values.servingSize)}
              onChangeText={onChangeByField.servingSize}
              placeholder="100"
              keyboardType="decimal-pad"
              containerStyle={styles.servingField}
              error={errors.servingSize}
            />
            <VStack style={styles.servingUnitField}>
              <Caption color={theme.text.muted} style={styles.servingUnitLabel}>
                Unit
              </Caption>
              <Picker
                options={unitOptions}
                onOptionSelect={(opt) => setValue("unit", opt.value)}
                placeholder={values.unit || "g"}
              />
            </VStack>
          </HStack>
        )}

        <Caption color={theme.text.muted}>{nutritionLabel}</Caption>

        <TextInput
          label="Calories"
          value={formatNumber(values.energy)}
          onChangeText={onChangeByField.energy}
          placeholder="0"
          keyboardType="decimal-pad"
          unit="kcal"
          error={errors.energy}
        />

        <HStack gap={1}>
          <TextInput
            label="Protein"
            value={formatNumber(values.protein)}
            onChangeText={onChangeByField.protein}
            placeholder="0"
            keyboardType="decimal-pad"
            unit="g"
            inputStyle={styles.macroInput}
            containerStyle={styles.inputContainer}
            error={errors.protein}
          />
          <TextInput
            label="Carbs"
            value={formatNumber(values.carbs)}
            onChangeText={onChangeByField.carbs}
            placeholder="0"
            keyboardType="decimal-pad"
            unit="g"
            inputStyle={styles.macroInput}
            containerStyle={styles.inputContainer}
            error={errors.carbs}
          />
          <TextInput
            label="Fat"
            value={formatNumber(values.fat)}
            onChangeText={onChangeByField.fat}
            placeholder="0"
            keyboardType="decimal-pad"
            unit="g"
            inputStyle={styles.macroInput}
            containerStyle={styles.inputContainer}
            error={errors.fat}
          />
        </HStack>

        <Pressable
          onPress={() => setShowMoreDetails((v) => !v)}
          style={styles.moreDetailsToggle}
        >
          <Icon
            name={showMoreDetails ? "expand-more" : "chevron-right"}
            size="xs"
            color={theme.text.muted}
          />
          <Caption color={theme.text.muted}>More details</Caption>
        </Pressable>

        {showMoreDetails && (
          <VStack gap={2}>
            <TextInput
              label="Brand"
              value={values.brand ?? ""}
              onChangeText={onChangeByField.brand}
              placeholder="Optional"
            />
            <TextInput
              label="Barcode"
              value={values.barcode ?? ""}
              onChangeText={onChangeByField.barcode}
              placeholder="Optional"
            />
          </VStack>
        )}

        <Box paddingTop={1}>
          <Button variant="primary" onPress={onSave} disabled={submitting}>
            Save food
          </Button>
        </Box>
      </VStack>
    </SafeVStack>
  );
}
