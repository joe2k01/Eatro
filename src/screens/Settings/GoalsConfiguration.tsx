import { SafeVStack } from "@components/SafeVStack";
import { Button } from "@components/buttons/Button";
import { Box } from "@components/layout/Box";
import { HStack } from "@components/layout/HStack";
import { VStack } from "@components/layout/VStack";
import { TextBody, TextCaption, Title1 } from "@components/typography/Text";
import { useTheme } from "@contexts/ThemeProvider";
import { useStorage } from "@hooks/useStorage";
import { useThemeDimension } from "@hooks/useThemeDimension";
import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, TextInput } from "react-native";
import { z } from "zod";
import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { useStaticNavigationOptions } from "@hooks/useStaticNavigationOptions";

const goalsSchema = z
  .object({
    calories: z.number().int().nonnegative(),
    protein: z.number().int().nonnegative(),
    carbs: z.number().int().nonnegative(),
    fat: z.number().int().nonnegative(),
  })
  .partial();

type Goals = z.infer<typeof goalsSchema>;

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
  const { popover, fgPopover } = useTheme();
  const { data, storageApi } = useStorage("goals", goalsSchema);

  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  useEffect(() => {
    storageApi.current?.load();
  }, [storageApi]);

  useEffect(() => {
    const mData = data as Goals;
    setCalories(mData.calories === undefined ? "" : String(mData.calories));
    setProtein(mData.protein === undefined ? "" : String(mData.protein));
    setCarbs(mData.carbs === undefined ? "" : String(mData.carbs));
    setFat(mData.fat === undefined ? "" : String(mData.fat));
  }, [data]);

  const borderRadius = useThemeDimension(0.5);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        input: {
          backgroundColor: popover,
          color: fgPopover,
          borderRadius,
          paddingHorizontal: 12,
          paddingVertical: 10,
          fontSize: 16,
        },
      }),
    [borderRadius, fgPopover, popover],
  );

  const onSave = useCallback(() => {
    const payload: Goals = {
      calories: parseOptionalInt(calories),
      protein: parseOptionalInt(protein),
      carbs: parseOptionalInt(carbs),
      fat: parseOptionalInt(fat),
    };

    const parsed = goalsSchema.parse(payload);
    storageApi.current?.store(parsed);
  }, [calories, carbs, fat, protein, storageApi]);

  return (
    <SafeVStack paddingHorizontal={2} scrollable>
      <VStack paddingBlock={2} gap={2}>
        <VStack gap={0.5}>
          <Title1>Goals configuration</Title1>
          <TextCaption>
            Set daily targets. Leave blank if you don&apos;t want to track a
            macro yet.
          </TextCaption>
        </VStack>

        <VStack gap={2}>
          <VStack gap={0.5}>
            <HStack justifyContent="space-between" alignItems="baseline">
              <TextBody>Calories</TextBody>
              <TextCaption>kcal</TextCaption>
            </HStack>
            <TextInput
              value={calories}
              onChangeText={setCalories}
              placeholder="e.g. 2200"
              keyboardType="number-pad"
              style={styles.input}
            />
          </VStack>

          <VStack gap={0.5}>
            <HStack justifyContent="space-between" alignItems="baseline">
              <TextBody>Protein</TextBody>
              <TextCaption>g</TextCaption>
            </HStack>
            <TextInput
              value={protein}
              onChangeText={setProtein}
              placeholder="e.g. 150"
              keyboardType="number-pad"
              style={styles.input}
            />
          </VStack>

          <VStack gap={0.5}>
            <HStack justifyContent="space-between" alignItems="baseline">
              <TextBody>Carbs</TextBody>
              <TextCaption>g</TextCaption>
            </HStack>
            <TextInput
              value={carbs}
              onChangeText={setCarbs}
              placeholder="e.g. 250"
              keyboardType="number-pad"
              style={styles.input}
            />
          </VStack>

          <VStack gap={0.5}>
            <HStack justifyContent="space-between" alignItems="baseline">
              <TextBody>Fat</TextBody>
              <TextCaption>g</TextCaption>
            </HStack>
            <TextInput
              value={fat}
              onChangeText={setFat}
              placeholder="e.g. 60"
              keyboardType="number-pad"
              style={styles.input}
            />
          </VStack>
        </VStack>

        <Box paddingTop={1}>
          <Button onPress={onSave}>Save goals</Button>
        </Box>
      </VStack>
    </SafeVStack>
  );
}
