import { useCallback, useEffect, useRef, useState } from "react";
import { HStack } from "@components/layout/HStack";
import { VStack } from "@components/layout/VStack";
import { Button } from "@components/buttons/Button";
import { TextInput } from "@components/forms";
import { Heading } from "@components/typography/Text";
import { useRepositories } from "@db/context/DatabaseProvider";
import { SnackbarVariant, useSnackbar } from "@components/feedback";
import type { TrayApi } from "@components/layout/Tray";
import { Tray } from "@components/layout/Tray";
import { useMealRSession } from "../MealRSessionProvider";

const flexStyle = { flex: 1 } as const;

export function MealRSaveMealForm() {
  const { items, totals, clearItems, returnToSession } = useMealRSession();
  const { customMeal, customMealFood } = useRepositories();
  const showSnackbar = useSnackbar();
  const trayRef = useRef<TrayApi>(null);

  const [mealName, setMealName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    trayRef.current?.openTray();
  }, []);

  const closeTray = useCallback(async () => {
    await trayRef.current?.closeTray();
  }, []);

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

      clearItems();
      await closeTray();
    } catch {
      showSnackbar({
        message: "Could not save meal. Try again.",
        variant: SnackbarVariant.Error,
      });
    } finally {
      setSaving(false);
    }
  }, [
    closeTray,
    clearItems,
    customMeal,
    customMealFood,
    items,
    mealName,
    showSnackbar,
    totals,
  ]);

  return (
    <Tray ref={trayRef} lockDismiss onDismiss={returnToSession}>
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
            onPress={closeTray}
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
    </Tray>
  );
}
