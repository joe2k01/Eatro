import { VStack } from "@components/layout/VStack";
import { Goals } from "@constants/storage/validators";
import { useStorage } from "@hooks/useStorage";
import { TextBody, TextCaption } from "@components/typography/Text";
import { useMemo } from "react";
import { Icon } from "@components/media/Icon";
import { HStack } from "@components/layout/HStack";
import { AllColours } from "@constants/theme";
import { useTheme } from "@contexts/ThemeProvider";

type MacroLabel = Exclude<keyof Goals, "calories">;

type MacroProgressProps = {
  label: MacroLabel;
  consumedGrams: number;
};

const labels: Record<MacroLabel, [string, AllColours]> = {
  protein: ["Protein", "primary"],
  carbs: ["Carbs", "secondary"],
  fat: ["Fat", "accent"],
};

const defaultGoals: Goals = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 50,
};

export function MacroProgress({ label, consumedGrams }: MacroProgressProps) {
  const [labelText, labelVariant] = labels[label];

  const colour = useTheme()[labelVariant];

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

  return (
    <VStack backgroundColor="transparent">
      <HStack backgroundColor="transparent" alignItems="center" gap={0.5}>
        <Icon name="circle" size="xs" color={colour} />
        <TextCaption color={overGoal ? "destructive" : "fgCard"}>
          {labelText}
        </TextCaption>
      </HStack>
      <TextBody color={overGoal ? "destructive" : "fgCard"}>
        {progress} / {roundGoal} g
      </TextBody>
    </VStack>
  );
}
