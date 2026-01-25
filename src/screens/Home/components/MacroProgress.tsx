import { VStack } from "@components/layout/VStack";
import { Goals } from "@constants/storage/validators";
import { useStorage } from "@hooks/useStorage";
import { Body, Caption } from "@components/typography/Text";
import { useMemo } from "react";
import { Icon } from "@components/media/Icon";
import { HStack } from "@components/layout/HStack";
import { useTheme } from "@contexts/ThemeProvider";

type MacroLabel = Exclude<keyof Goals, "calories">;

type MacroProgressProps = {
  label: MacroLabel;
  consumedGrams: number;
};

const labels: Record<MacroLabel, string> = {
  protein: "Protein",
  carbs: "Carbs",
  fat: "Fat",
};

const defaultGoals: Goals = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 50,
};

export function MacroProgress({ label, consumedGrams }: MacroProgressProps) {
  const labelText = labels[label];
  const theme = useTheme();

  const colour = useMemo(() => {
    switch (label) {
      case "protein":
        return theme.semantic.primary;
      case "carbs":
        return theme.semantic.secondary;
      case "fat":
        return theme.semantic.accent;
    }
  }, [
    label,
    theme.semantic.accent,
    theme.semantic.primary,
    theme.semantic.secondary,
  ]);

  const { data: goals } = useStorage("goals", defaultGoals);

  const progress = useMemo(() => {
    return Math.round(consumedGrams);
  }, [consumedGrams]);

  const roundGoal = useMemo(() => {
    return Math.round(goals?.[label] ?? 0);
  }, [goals, label]);

  const overGoal = useMemo(() => {
    return progress > roundGoal;
  }, [progress, roundGoal]);

  const textColor = overGoal
    ? theme.semantic.destructive
    : theme.text.secondary;

  return (
    <VStack backgroundColor="transparent">
      <HStack backgroundColor="transparent" alignItems="center" gap={0.5}>
        <Icon name="circle" size="xs" color={colour} />
        <Caption color={textColor}>{labelText}</Caption>
      </HStack>
      <Body color={textColor}>
        {progress} / {roundGoal} g
      </Body>
    </VStack>
  );
}
