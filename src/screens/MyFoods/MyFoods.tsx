import { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  ListRenderItemInfo,
  Pressable,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type {
  NativeStackNavigationOptions,
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import { SafeVStack } from "@components/SafeVStack";
import { VStack } from "@components/layout/VStack";
import { HStack } from "@components/layout/HStack";
import { Body, Caption, Title } from "@components/typography/Text";
import { TextInput } from "@components/forms";
import { Button } from "@components/buttons/Button";
import { IconButton } from "@components/buttons/IconButton";
import { PillButton } from "@components/buttons/PillButton";
import { useTheme } from "@contexts/ThemeProvider";
import { useDynamicNavigationOptions } from "@hooks/useDynamicNavigationOptions";
import { spacing } from "@constants/theme";
import type { Food, CustomMeal } from "@db/schemas";
import { SearchResultItem } from "@screens/Search/components/SearchResultItem";
import { useManualFoods } from "./hooks/useManualFoods";
import { useCustomMeals } from "./hooks/useCustomMeals";
import type { MyFoodsStackParamsList } from "../../AppTabs";

type TabValue = "foods" | "meals";

const tabOptions: { label: string; value: TabValue }[] = [
  { label: "Foods", value: "foods" },
  { label: "Meals", value: "meals" },
];

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  emptyOuter: {
    flex: 1,
    justifyContent: "space-between",
  },
  emptyCard: {
    alignItems: "center",
  },
  bottomButton: {
    paddingHorizontal: spacing(2),
    paddingBottom: spacing(2),
  },
  mealRow: {
    paddingVertical: spacing(1),
  },
  pressed: {
    opacity: 0.7,
  },
});

function CustomMealRow({ item }: { item: CustomMeal }) {
  const theme = useTheme();
  const navigation = useNavigation();

  const onPress = useCallback(() => {
    navigation.navigate("CustomMealDetail", { customMealId: item.id });
  }, [item.id, navigation]);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => (pressed ? styles.pressed : undefined)}
    >
      <HStack
        style={styles.mealRow}
        justifyContent="space-between"
        alignItems="center"
      >
        <VStack flex={1} backgroundColor="transparent">
          <Body numberOfLines={1}>{item.name}</Body>
          <Caption color={theme.text.muted}>
            {Math.round(item.energy)} kcal · P: {Math.round(item.proteins)}g C:{" "}
            {Math.round(item.carbohydrates)}g F: {Math.round(item.fat)}g
          </Caption>
        </VStack>
      </HStack>
    </Pressable>
  );
}

export function MyFoods() {
  const theme = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<MyFoodsStackParamsList>>();

  const [tab, setTab] = useState<TabValue>("foods");
  const [filterQuery, setFilterQuery] = useState("");

  const foods = useManualFoods(filterQuery);
  const meals = useCustomMeals(filterQuery);

  const navigateToCreateFood = useCallback(() => {
    navigation.navigate("CreateFood");
  }, [navigation]);

  const headerOptions = useMemo<NativeStackNavigationOptions>(
    () => ({
      headerTitle: () => <Title>My Foods</Title>,
      headerRight: () =>
        tab === "foods" ? (
          <IconButton
            name="add"
            variant="tertiary"
            onPress={navigateToCreateFood}
          />
        ) : null,
    }),
    [navigateToCreateFood, tab],
  );
  useDynamicNavigationOptions(headerOptions);

  const renderFoodItem = useCallback(
    ({ item }: ListRenderItemInfo<Food>) => (
      <SearchResultItem item={item} source="local" />
    ),
    [],
  );

  const renderMealItem = useCallback(
    ({ item }: ListRenderItemInfo<CustomMeal>) => <CustomMealRow item={item} />,
    [],
  );

  const foodKeyExtractor = useCallback((item: Food) => String(item.id), []);
  const mealKeyExtractor = useCallback(
    (item: CustomMeal) => String(item.id),
    [],
  );

  const isFoodsEmpty = foods.length === 0 && !filterQuery.trim();
  const isMealsEmpty = meals.length === 0 && !filterQuery.trim();

  return (
    <SafeVStack guard="bottom" flex={1} paddingTop={1}>
      <VStack paddingHorizontal={2} alignItems="center">
        <PillButton options={tabOptions} selected={tab} onSelect={setTab} />
      </VStack>

      {tab === "foods" ? (
        isFoodsEmpty ? (
          <VStack style={styles.emptyOuter} flex={1}>
            <VStack paddingHorizontal={2}>
              <VStack
                borderRadius={8}
                backgroundColor={theme.surface.secondary}
                padding={2}
                style={styles.emptyCard}
              >
                <Caption color={theme.text.muted}>
                  Your custom foods will appear here
                </Caption>
              </VStack>
            </VStack>
            <VStack style={styles.bottomButton}>
              <Button variant="primary" onPress={navigateToCreateFood}>
                Add your first food
              </Button>
            </VStack>
          </VStack>
        ) : (
          <VStack flex={1} gap={1} paddingHorizontal={2}>
            <TextInput
              value={filterQuery}
              onChangeText={setFilterQuery}
              placeholder="Search my foods..."
            />
            <FlatList
              style={styles.list}
              data={foods}
              renderItem={renderFoodItem}
              keyExtractor={foodKeyExtractor}
              keyboardShouldPersistTaps="handled"
            />
          </VStack>
        )
      ) : isMealsEmpty ? (
        <VStack style={styles.emptyOuter} flex={1}>
          <VStack paddingHorizontal={2}>
            <VStack
              borderRadius={8}
              backgroundColor={theme.surface.secondary}
              padding={2}
              style={styles.emptyCard}
            >
              <Caption color={theme.text.muted}>
                Your saved meals will appear here. Use MealR to create one!
              </Caption>
            </VStack>
          </VStack>
        </VStack>
      ) : (
        <VStack flex={1} gap={1} paddingHorizontal={2}>
          <TextInput
            value={filterQuery}
            onChangeText={setFilterQuery}
            placeholder="Search my meals..."
          />
          <FlatList
            style={styles.list}
            data={meals}
            renderItem={renderMealItem}
            keyExtractor={mealKeyExtractor}
            keyboardShouldPersistTaps="handled"
          />
        </VStack>
      )}
    </SafeVStack>
  );
}

export type MyFoodsParams = undefined;
