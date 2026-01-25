import { useMemo } from "react";
import { HStack } from "@components/layout/HStack";
import { VStack } from "@components/layout/VStack";
import { Body } from "@components/typography/Text";
import { IconButton } from "@components/buttons/IconButton";
import { PillButton } from "@components/buttons/PillButton";
import { Button } from "@components/buttons/Button";
import { TextInput } from "@components/forms";
import { MealType } from "@db/schemas";
import { addUtcDaysSeconds } from "@db/utils/utc";

export type LogToMealControlsProps = {
  dayUtcSeconds: number;
  setDayUtcSeconds: (updater: (prev: number) => number) => void;
  mealType: MealType;
  setMealType: (value: MealType) => void;
  saving: boolean;
  canConfirm: boolean;
  customMealType: string;
  setCustomMealType: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
};

export function LogToMealControls({
  dayUtcSeconds,
  setDayUtcSeconds,
  mealType,
  setMealType,
  saving,
  canConfirm,
  customMealType,
  setCustomMealType,
  onCancel,
  onConfirm,
}: LogToMealControlsProps) {
  const dayLabel = useMemo(() => {
    return new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(new Date(dayUtcSeconds * 1000));
  }, [dayUtcSeconds]);

  const mealOptions = useMemo(() => {
    return [
      { label: "Breakfast", value: MealType.Breakfast },
      { label: "Lunch", value: MealType.Lunch },
      { label: "Dinner", value: MealType.Dinner },
      { label: "Snack", value: MealType.Snack },
      { label: "Custom", value: MealType.Custom },
    ];
  }, []);

  return (
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
            onPress={() => setDayUtcSeconds((d) => addUtcDaysSeconds(d, -1))}
            disabled={saving}
          />
          <Body>{dayLabel}</Body>
          <IconButton
            name="chevron-right"
            variant="tertiary"
            onPress={() => setDayUtcSeconds((d) => addUtcDaysSeconds(d, 1))}
            disabled={saving}
          />
        </HStack>
      </HStack>

      <VStack backgroundColor="transparent" gap={1}>
        <Body>Meal</Body>
        <PillButton<MealType>
          options={mealOptions}
          selected={mealType}
          onSelect={setMealType}
          variant="primary"
        />
      </VStack>

      {mealType === MealType.Custom ? (
        <TextInput
          value={customMealType}
          onChangeText={setCustomMealType}
          placeholder="e.g. Post-workout"
          inBottomSheet
        />
      ) : null}

      <HStack backgroundColor="transparent" gap={1}>
        <Button variant="tertiary" onPress={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button variant="primary" onPress={onConfirm} disabled={!canConfirm}>
          Confirm
        </Button>
      </HStack>
    </VStack>
  );
}
