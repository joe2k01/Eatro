import { useMemo } from "react";
import { HStack } from "@components/layout/HStack";
import { VStack } from "@components/layout/VStack";
import { Body, Caption } from "@components/typography/Text";
import type { MealRSessionTotals } from "../types";

type MealRSummaryProps = {
  totals: MealRSessionTotals;
  itemCount: number;
};

export function MealRSummary({ totals, itemCount }: MealRSummaryProps) {
  const entries = useMemo(
    () => [
      { label: "calories", value: String(Math.round(totals.energy)) },
      { label: "proteins", value: `${Math.round(totals.proteins)}g` },
      { label: "carbs", value: `${Math.round(totals.carbohydrates)}g` },
      { label: "fat", value: `${Math.round(totals.fat)}g` },
    ],
    [totals],
  );

  return (
    <VStack gap={1} backgroundColor="transparent">
      <Caption>
        {itemCount} {itemCount === 1 ? "item" : "items"}
      </Caption>
      <HStack
        backgroundColor="transparent"
        justifyContent="space-between"
        flex={1}
      >
        {entries.map((entry) => (
          <VStack key={entry.label} backgroundColor="transparent" flex={1}>
            <Body textAlign="center">{entry.value}</Body>
            <Caption textAlign="center">{entry.label}</Caption>
          </VStack>
        ))}
      </HStack>
    </VStack>
  );
}
