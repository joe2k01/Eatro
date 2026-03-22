import { memo, useCallback, useMemo, useState } from "react";
import {
  FlatList,
  ListRenderItemInfo,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type {
  NativeStackNavigationOptions,
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import {
  TabBar,
  TabView,
  type Route,
  type TabBarProps,
} from "react-native-tab-view";
import { SafeVStack } from "@components/SafeVStack";
import { VStack } from "@components/layout/VStack";
import { HStack } from "@components/layout/HStack";
import { Body, Caption, Title } from "@components/typography/Text";
import { TextInput } from "@components/forms";
import { Button } from "@components/buttons/Button";
import { IconButton } from "@components/buttons/IconButton";
import { useTheme } from "@contexts/ThemeProvider";
import { useDynamicNavigationOptions } from "@hooks/useDynamicNavigationOptions";
import { spacing, Typography } from "@constants/theme";
import type { Food, CustomMeal } from "@db/schemas";
import { SearchResultItem } from "@screens/Search/components/SearchResultItem";
import { useManualFoods } from "./hooks/useManualFoods";
import { useCustomMeals } from "./hooks/useCustomMeals";
import type { MyFoodsStackParamsList } from "../../AppTabs";

const MY_FOODS_ROUTES: Route[] = [
  { key: "foods", title: "Foods" },
  { key: "meals", title: "Meals" },
];

const styles = StyleSheet.create({
  list: {
    flex: 1,
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

type FoodsSceneProps = {
  filterQuery: string;
  onFilterQueryChange: (value: string) => void;
  onAddFirstFood: () => void;
};

const MyFoodsFoodsScene = memo(function MyFoodsFoodsScene({
  filterQuery,
  onFilterQueryChange,
  onAddFirstFood,
}: FoodsSceneProps) {
  const theme = useTheme();
  const foods = useManualFoods(filterQuery);

  const renderFoodItem = useCallback(
    ({ item }: ListRenderItemInfo<Food>) => (
      <SearchResultItem item={item} source="local" />
    ),
    [],
  );

  const foodKeyExtractor = useCallback((item: Food) => String(item.id), []);

  const isFoodsEmpty = foods.length === 0 && !filterQuery.trim();

  if (isFoodsEmpty) {
    return (
      <VStack flex={1} justifyContent="space-between">
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
          <Button variant="primary" onPress={onAddFirstFood}>
            Add your first food
          </Button>
        </VStack>
      </VStack>
    );
  }

  return (
    <VStack flex={1} gap={1} paddingHorizontal={2}>
      <TextInput
        value={filterQuery}
        onChangeText={onFilterQueryChange}
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
  );
});

type MealsSceneProps = {
  filterQuery: string;
  onFilterQueryChange: (value: string) => void;
};

const MyFoodsMealsScene = memo(function MyFoodsMealsScene({
  filterQuery,
  onFilterQueryChange,
}: MealsSceneProps) {
  const theme = useTheme();
  const meals = useCustomMeals(filterQuery);

  const renderMealItem = useCallback(
    ({ item }: ListRenderItemInfo<CustomMeal>) => <CustomMealRow item={item} />,
    [],
  );

  const mealKeyExtractor = useCallback(
    (item: CustomMeal) => String(item.id),
    [],
  );

  const isMealsEmpty = meals.length === 0 && !filterQuery.trim();

  if (isMealsEmpty) {
    return (
      <VStack flex={1}>
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
    );
  }

  return (
    <VStack flex={1} gap={1} paddingHorizontal={2}>
      <TextInput
        value={filterQuery}
        onChangeText={onFilterQueryChange}
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
  );
});

export function MyFoods() {
  const theme = useTheme();
  const layout = useWindowDimensions();
  const navigation =
    useNavigation<NativeStackNavigationProp<MyFoodsStackParamsList>>();

  const [index, setIndex] = useState(0);
  const [filterQuery, setFilterQuery] = useState("");

  const navigateToCreateFood = useCallback(() => {
    navigation.navigate("CreateFood");
  }, [navigation]);

  const headerOptions = useMemo<NativeStackNavigationOptions>(
    () => ({
      headerTitle: () => <Title>My Foods</Title>,
      headerRight: () =>
        index === 0 ? (
          <IconButton
            name="add"
            variant="tertiary"
            onPress={navigateToCreateFood}
          />
        ) : null,
    }),
    [index, navigateToCreateFood],
  );
  useDynamicNavigationOptions(headerOptions);

  const renderScene = useCallback(
    ({ route }: { route: Route }) => {
      switch (route.key) {
        case "foods":
          return (
            <MyFoodsFoodsScene
              filterQuery={filterQuery}
              onFilterQueryChange={setFilterQuery}
              onAddFirstFood={navigateToCreateFood}
            />
          );
        case "meals":
          return (
            <MyFoodsMealsScene
              filterQuery={filterQuery}
              onFilterQueryChange={setFilterQuery}
            />
          );
        default:
          return null;
      }
    },
    [filterQuery, navigateToCreateFood],
  );

  const renderTabBar = useCallback(
    (props: TabBarProps<Route>) => (
      <TabBar
        {...props}
        style={{ backgroundColor: theme.surface.primary }}
        indicatorStyle={{ backgroundColor: theme.semantic.primary }}
        activeColor={theme.text.primary}
        inactiveColor={theme.text.muted}
        pressColor={theme.semantic.secondary}
        contentContainerStyle={{ paddingHorizontal: spacing(2) }}
        android_ripple={{ color: theme.semantic.secondary }}
      />
    ),
    [theme],
  );

  return (
    <SafeVStack guard="bottom" flex={1} paddingTop={1}>
      <TabView
        navigationState={{ index, routes: MY_FOODS_ROUTES }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={renderTabBar}
        style={{ flex: 1 }}
        keyboardDismissMode="on-drag"
        commonOptions={{
          labelStyle: [Typography.label, { textTransform: "none" }],
        }}
      />
    </SafeVStack>
  );
}

export type MyFoodsParams = undefined;
