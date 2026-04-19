import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  ListRenderItemInfo,
  Pressable,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useParams } from "@hooks/useParams";
import { Screen } from "@components/layout/Screen";
import { VStack } from "@components/layout/VStack";
import { HStack } from "@components/layout/HStack";
import { Body, Caption, Heading } from "@components/typography/Text";
import { Button } from "@components/buttons/Button";
import { IconButton } from "@components/buttons/IconButton";
import { Tray, type TrayApi } from "@components/layout/Tray";
import { Picker, TextInput } from "@components/forms";
import { BarcodeProductThumbnail } from "@components/media/BarcodeProductThumbnail";
import { useTheme } from "@contexts/ThemeProvider";
import { SnackbarVariant, useSnackbar } from "@components/feedback";
import { useRepositories } from "@db/context/DatabaseProvider";
import type { CustomMeal } from "@db/schemas";
import type { CustomMealFoodWithBarcode } from "@db/schemas/CustomMealFood";
import { MealType } from "@db/schemas";
import { utcStartOfTodaySeconds, addUtcDaysSeconds } from "@db/utils/utc";
import { BorderRadius, spacing } from "@constants/theme";
import { mealOptions } from "@constants/mealOptions";
import { SEARCH_RESULT_THUMBNAIL_SIZE } from "@screens/Search/components/SearchResultItem";

export type CustomMealDetailParams = { customMealId: number };

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  foodRow: {
    paddingVertical: spacing(1),
  },
  thumbnail: {
    width: SEARCH_RESULT_THUMBNAIL_SIZE,
    height: SEARCH_RESULT_THUMBNAIL_SIZE,
  },
  pressed: {
    opacity: 0.7,
  },
});

function FoodRow({ item }: { item: CustomMealFoodWithBarcode }) {
  const theme = useTheme();
  const navigation = useNavigation();

  const onPress = useCallback(() => {
    const code = item.barcode?.trim();
    navigation.navigate("Product", {
      foodId: item.food_id,
      ...(code ? { barcode: code } : {}),
    });
  }, [item.barcode, item.food_id, navigation]);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => (pressed ? styles.pressed : undefined)}
    >
      <HStack style={styles.foodRow} gap={1.5} alignItems="center">
        <BarcodeProductThumbnail
          barcode={item.barcode}
          shape="squircle"
          style={styles.thumbnail}
        />
        <VStack flex={1} backgroundColor="transparent" gap={0.25}>
          <Body numberOfLines={1}>{item.name}</Body>
          {item.brand ? (
            <Caption color={theme.text.muted} numberOfLines={1}>
              {item.brand}
            </Caption>
          ) : null}
          <Caption color={theme.text.muted}>
            {item.quantity} × {item.serving_size}g · {Math.round(item.energy)}{" "}
            kcal
          </Caption>
        </VStack>
      </HStack>
    </Pressable>
  );
}

export function CustomMealDetail() {
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
  const [foods, setFoods] = useState<CustomMealFoodWithBarcode[]>([]);
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

  const macroCardStyle = useMemo(
    () => ({
      borderRadius: BorderRadius.lg,
      backgroundColor: theme.surface.secondary,
    }),
    [theme.surface.secondary],
  );

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
    ({ item }: ListRenderItemInfo<CustomMealFoodWithBarcode>) => (
      <FoodRow item={item} />
    ),
    [],
  );

  const keyExtractor = useCallback(
    (item: CustomMealFoodWithBarcode) => String(item.id),
    [],
  );

  const canConfirm = !saving;

  if (!mealData) return null;

  return (
    <Screen title="Meal Detail" paddingTop={1}>
      <VStack gap={1.5} backgroundColor="transparent">
        <Heading>{mealData.name}</Heading>
        <VStack gap={1.5} padding={2} style={macroCardStyle}>
          <HStack
            backgroundColor="transparent"
            justifyContent="space-between"
            alignItems="stretch"
          >
            <VStack backgroundColor="transparent" flex={1} alignItems="center">
              <Body textAlign="center">{Math.round(mealData.energy)}</Body>
              <Caption textAlign="center" color={theme.text.muted}>
                calories
              </Caption>
            </VStack>
            <VStack backgroundColor="transparent" flex={1} alignItems="center">
              <Body textAlign="center">{Math.round(mealData.proteins)}g</Body>
              <Caption textAlign="center" color={theme.text.muted}>
                protein
              </Caption>
            </VStack>
            <VStack backgroundColor="transparent" flex={1} alignItems="center">
              <Body textAlign="center">
                {Math.round(mealData.carbohydrates)}g
              </Body>
              <Caption textAlign="center" color={theme.text.muted}>
                carbs
              </Caption>
            </VStack>
            <VStack backgroundColor="transparent" flex={1} alignItems="center">
              <Body textAlign="center">{Math.round(mealData.fat)}g</Body>
              <Caption textAlign="center" color={theme.text.muted}>
                fat
              </Caption>
            </VStack>
          </HStack>
        </VStack>
      </VStack>

      <VStack gap={0.25} paddingTop={1} backgroundColor="transparent">
        <Body>Foods</Body>
        <Caption color={theme.text.muted}>
          {foods.length} {foods.length === 1 ? "item" : "items"}
        </Caption>
      </VStack>

      <FlatList
        style={styles.list}
        data={foods}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        keyboardShouldPersistTaps="handled"
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
    </Screen>
  );
}
