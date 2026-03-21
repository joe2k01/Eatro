import { useCallback, useEffect, useState } from "react";
import { HStack } from "@components/layout/HStack";
import { VStack } from "@components/layout/VStack";
import { Button } from "@components/buttons/Button";
import { TextInput } from "@components/forms";
import { Heading } from "@components/typography/Text";
import { useRepositories } from "@db/context/DatabaseProvider";
import { SnackbarVariant, useSnackbar } from "@components/feedback";
import type { MealRSessionItem, MealRSessionTotals } from "../types";

const flexStyle = { flex: 1 } as const;

type MealRSaveMealFormProps = {
  /** Increment when the save tray opens so the name field resets. */
  saveSessionKey: number;
  items: MealRSessionItem[];
  totals: MealRSessionTotals;
  onSaved: () => void;
  onRequestClose: () => Promise<void>;
};

export function MealRSaveMealForm({
  saveSessionKey,
  items,
  totals,
  onSaved,
  onRequestClose,
}: MealRSaveMealFormProps) {
  const { customMeal, customMealFood } = useRepositories();
  const showSnackbar = useSnackbar();

  const [mealName, setMealName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMealName("");
  }, [saveSessionKey]);

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
          name: item.name,
          brand: item.brand,
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

      await onRequestClose();
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
    onRequestClose,
    onSaved,
    showSnackbar,
    totals,
  ]);

  const onCancel = useCallback(async () => {
    await onRequestClose();
  }, [onRequestClose]);

  return (
    <VStack gap={2} backgroundColor="transparent">
      <Heading>Name this meal</Heading>
      <TextInput
        value={mealName}
        onChangeText={setMealName}
        placeholder="Meal name"
        autoFocus
        inBottomSheet
      />
      <HStack gap={1} backgroundColor="transparent">
        <Button
          variant="tertiary"
          onPress={onCancel}
          disabled={saving}
          style={flexStyle}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onPress={onSave}
          disabled={!mealName.trim() || saving}
          style={flexStyle}
        >
          Save
        </Button>
      </HStack>
    </VStack>
  );
}
