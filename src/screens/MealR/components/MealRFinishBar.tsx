import { useCallback, useState } from "react";
import { StyleSheet } from "react-native";
import { HStack } from "@components/layout/HStack";
import { VStack } from "@components/layout/VStack";
import { Button } from "@components/buttons/Button";
import { TextInput } from "@components/forms";
import { useRepositories } from "@db/context/DatabaseProvider";
import { SnackbarVariant, useSnackbar } from "@components/feedback";
import type { MealRSessionItem, MealRSessionTotals } from "../types";

const styles = StyleSheet.create({
  flexButton: {
    flex: 1,
  },
});

type MealRFinishBarProps = {
  items: MealRSessionItem[];
  totals: MealRSessionTotals;
  onSaved: () => void;
};

export function MealRFinishBar({
  items,
  totals,
  onSaved,
}: MealRFinishBarProps) {
  const { customMeal, customMealFood } = useRepositories();
  const showSnackbar = useSnackbar();

  const [naming, setNaming] = useState(false);
  const [mealName, setMealName] = useState("");
  const [saving, setSaving] = useState(false);

  const onSave = useCallback(async () => {
    const trimmed = mealName.trim();
    if (!trimmed || items.length === 0) return;

    setSaving(true);

    try {
      const nowMs = Date.now();
      await customMeal.createCustomMealWithFoodsTx(
        {
          name: trimmed,
          energy: totals.energy,
          proteins: totals.proteins,
          carbohydrates: totals.carbohydrates,
          fat: totals.fat,
          nowMs,
        },
        items.map((item) => ({
          foodId: item.foodId,
          quantity: item.quantity,
          servingSize: item.servingSize,
          energy: item.energy,
          proteins: item.proteins,
          carbohydrates: item.carbohydrates,
          fat: item.fat,
        })),
        customMealFood,
      );

      showSnackbar({
        message: `"${trimmed}" saved!`,
        variant: SnackbarVariant.Success,
      });

      onSaved();
    } catch {
      showSnackbar({
        message: "Could not save meal. Try again.",
        variant: SnackbarVariant.Error,
      });
    } finally {
      setSaving(false);
    }
  }, [
    customMeal,
    customMealFood,
    items,
    mealName,
    onSaved,
    showSnackbar,
    totals,
  ]);

  if (!naming) {
    return (
      <Button
        variant="primary"
        onPress={() => setNaming(true)}
        disabled={items.length === 0}
      >
        Save meal
      </Button>
    );
  }

  return (
    <VStack gap={1} backgroundColor="transparent">
      <TextInput
        value={mealName}
        onChangeText={setMealName}
        placeholder="Meal name"
        autoFocus
      />
      <HStack gap={1} backgroundColor="transparent">
        <Button
          variant="tertiary"
          onPress={() => {
            setNaming(false);
            setMealName("");
          }}
          disabled={saving}
          style={styles.flexButton}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onPress={onSave}
          disabled={!mealName.trim() || saving}
          style={styles.flexButton}
        >
          Save
        </Button>
      </HStack>
    </VStack>
  );
}
