import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, ListRenderItemInfo, StyleSheet } from "react-native";
import { useParams } from "@hooks/useParams";
import { useStaticNavigationOptions } from "@hooks/useStaticNavigationOptions";
import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { SafeVStack } from "@components/SafeVStack";
import { VStack } from "@components/layout/VStack";
import { HStack } from "@components/layout/HStack";
import { Body, Caption, Heading, Title } from "@components/typography/Text";
import { Button } from "@components/buttons/Button";
import { IconButton } from "@components/buttons/IconButton";
import { Tray, type TrayApi } from "@components/layout/Tray";
import { Picker, TextInput } from "@components/forms";
import { useTheme } from "@contexts/ThemeProvider";
import { SnackbarVariant, useSnackbar } from "@components/feedback";
import { useRepositories } from "@db/context/DatabaseProvider";
import type { CustomMeal, CustomMealFood } from "@db/schemas";
import { MealType } from "@db/schemas";
import { utcStartOfTodaySeconds, addUtcDaysSeconds } from "@db/utils/utc";
import { spacing } from "@constants/theme";
import { mealOptions } from "@constants/mealOptions";

export type CustomMealDetailParams = { customMealId: number };

const headerOptions = {
  headerTitle: () => <Title>Meal Detail</Title>,
} satisfies NativeStackNavigationOptions;

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  foodRow: {
    paddingVertical: spacing(1),
  },
});

function FoodRow({ item }: { item: CustomMealFood }) {
  const theme = useTheme();

  return (
    <HStack
      style={styles.foodRow}
      justifyContent="space-between"
      alignItems="center"
    >
      <VStack flex={1} backgroundColor="transparent">
        <Body numberOfLines={1}>{item.name}</Body>
        <Caption color={theme.text.muted}>
          {item.quantity} × {item.serving_size}g · {Math.round(item.energy)}{" "}
          kcal
        </Caption>
      </VStack>
    </HStack>
  );
}

export function CustomMealDetail() {
  useStaticNavigationOptions(headerOptions);
  const { customMealId } = useParams<CustomMealDetailParams>();
  const theme = useTheme();
  const showSnackbar = useSnackbar();
  const {
    customMeal: customMealRepo,
    customMealFood,
    meal,
    mealFood,
  } = useRepositories();

  const [mealData, setMealData] = useState<CustomMeal | null>(null);
  const [foods, setFoods] = useState<CustomMealFood[]>([]);
  const [saving, setSaving] = useState(false);

  const trayRef = useRef<TrayApi>(null);

  const [dayUtcSeconds, setDayUtcSeconds] = useState(() =>
    utcStartOfTodaySeconds(),
  );
  const [mealType, setMealType] = useState<
    (typeof mealOptions)[number] | undefined
  >(undefined);
  const [customMealType, setCustomMealType] = useState("");

  useEffect(() => {
    let active = true;

    async function loadMealData() {
      const [m, f] = await Promise.all([
        customMealRepo.getCustomMealById(customMealId),
        customMealFood.getFoodsByCustomMealId(customMealId),
      ]);

      if (active) {
        setMealData(m);
        setFoods(f ?? []);
      }
    }
    loadMealData();

    return () => {
      active = false;
    };
  }, [customMealId, customMealRepo, customMealFood]);

  const dayLabel = useMemo(() => {
    return new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(new Date(dayUtcSeconds * 1000));
  }, [dayUtcSeconds]);

  const openLogTray = useCallback(() => {
    trayRef.current?.openTray();
  }, []);

  const onConfirmLog = useCallback(async () => {
    if (saving || !mealData) return;

    setSaving(true);

    try {
      const normalizedCustomType =
        mealType?.value === MealType.Custom ? customMealType.trim() : null;

      const nowMs = Date.now();
      const mealId = await meal.logCustomMealTx(
        {
          dayUtcSeconds,
          type: mealType?.value ?? MealType.Snack,
          customType: normalizedCustomType,
          customMealId,
          nowMs,
        },
        customMealRepo,
        customMealFood,
        mealFood,
      );

      if (mealId === null) {
        throw new Error("Failed to log meal");
      }

      await trayRef.current?.closeTray();

      showSnackbar({
        message: "Meal logged successfully",
        variant: SnackbarVariant.Success,
      });
    } catch (error) {
      showSnackbar({
        message:
          error instanceof Error
            ? error.message
            : "Failed to log meal, please try again",
        variant: SnackbarVariant.Error,
      });
    } finally {
      setSaving(false);
    }
  }, [
    customMealFood,
    customMealId,
    customMealRepo,
    customMealType,
    dayUtcSeconds,
    meal,
    mealData,
    mealFood,
    mealType,
    saving,
    showSnackbar,
  ]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<CustomMealFood>) => <FoodRow item={item} />,
    [],
  );

  const keyExtractor = useCallback(
    (item: CustomMealFood) => String(item.id),
    [],
  );

  const canConfirm = !saving;

  if (!mealData) return null;

  return (
    <SafeVStack guard="bottom" flex={1} paddingHorizontal={2} paddingTop={1}>
      <VStack gap={1}>
        <Heading>{mealData.name}</Heading>
        <HStack
          backgroundColor="transparent"
          justifyContent="space-between"
          flex={1}
        >
          <VStack backgroundColor="transparent" flex={1}>
            <Body textAlign="center">{Math.round(mealData.energy)}</Body>
            <Caption textAlign="center">calories</Caption>
          </VStack>
          <VStack backgroundColor="transparent" flex={1}>
            <Body textAlign="center">{Math.round(mealData.proteins)}g</Body>
            <Caption textAlign="center">proteins</Caption>
          </VStack>
          <VStack backgroundColor="transparent" flex={1}>
            <Body textAlign="center">
              {Math.round(mealData.carbohydrates)}g
            </Body>
            <Caption textAlign="center">carbs</Caption>
          </VStack>
          <VStack backgroundColor="transparent" flex={1}>
            <Body textAlign="center">{Math.round(mealData.fat)}g</Body>
            <Caption textAlign="center">fat</Caption>
          </VStack>
        </HStack>
      </VStack>

      <Caption color={theme.text.muted}>
        {foods.length} {foods.length === 1 ? "item" : "items"}
      </Caption>

      <FlatList
        style={styles.list}
        data={foods}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
      />

      <Button variant="primary" onPress={openLogTray}>
        Add to diary
      </Button>

      <Tray ref={trayRef}>
        <VStack gap={2} backgroundColor="transparent">
          <Heading>Log &ldquo;{mealData.name}&rdquo;</Heading>

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
                onPress={() =>
                  setDayUtcSeconds((d) => addUtcDaysSeconds(d, -1))
                }
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

          <HStack
            backgroundColor="transparent"
            gap={3}
            alignItems="center"
            justifyContent="space-between"
          >
            <Body>Meal</Body>
            <Picker
              options={mealOptions}
              onOptionSelect={setMealType}
              variant="primary"
              inverted
            />
          </HStack>

          {mealType?.value === MealType.Custom ? (
            <TextInput
              value={customMealType}
              onChangeText={setCustomMealType}
              placeholder="e.g. Post-workout"
              inBottomSheet
            />
          ) : null}

          <Button
            variant="primary"
            onPress={onConfirmLog}
            disabled={
              !canConfirm ||
              (mealType?.value === MealType.Custom && !customMealType.trim())
            }
          >
            Confirm
          </Button>
        </VStack>
      </Tray>
    </SafeVStack>
  );
}
