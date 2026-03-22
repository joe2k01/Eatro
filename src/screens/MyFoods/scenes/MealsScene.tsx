import { memo, useCallback } from "react";
import type { ListRenderItemInfo } from "react-native";
import type { CustomMeal } from "@db/schemas";
import { useCustomMeals } from "../hooks/useCustomMeals";
import { CustomMealRow } from "../components/CustomMealRow";
import { MyFoodsEmptyStateCard } from "../components/MyFoodsEmptyStateCard";
import { MyFoodsSearchList } from "../components/MyFoodsSearchList";

export type MealsSceneProps = {
  filterQuery: string;
  onFilterQueryChange: (value: string) => void;
};

export const MealsScene = memo(function MealsScene({
  filterQuery,
  onFilterQueryChange,
}: MealsSceneProps) {
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
      <MyFoodsEmptyStateCard message="Your saved meals will appear here. Use MealR to create one!" />
    );
  }

  return (
    <MyFoodsSearchList
      filterQuery={filterQuery}
      onFilterQueryChange={onFilterQueryChange}
      placeholder="Search my meals..."
      data={meals}
      renderItem={renderMealItem}
      keyExtractor={mealKeyExtractor}
    />
  );
});
