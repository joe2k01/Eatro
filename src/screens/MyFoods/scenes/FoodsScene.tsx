import { memo, useCallback } from "react";
import type { ListRenderItemInfo } from "react-native";
import { VStack } from "@components/layout/VStack";
import { Button } from "@components/buttons/Button";
import type { Food } from "@db/schemas";
import { SearchResultItem } from "@screens/Search/components/SearchResultItem";
import { useManualFoods } from "../hooks/useManualFoods";
import { myFoodsStyles } from "../constants/styles";
import { MyFoodsEmptyStateCard } from "../components/MyFoodsEmptyStateCard";
import { MyFoodsSearchList } from "../components/MyFoodsSearchList";

export type FoodsSceneProps = {
  filterQuery: string;
  onFilterQueryChange: (value: string) => void;
  onAddFirstFood: () => void;
};

export const FoodsScene = memo(function FoodsScene({
  filterQuery,
  onFilterQueryChange,
  onAddFirstFood,
}: FoodsSceneProps) {
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
      <MyFoodsEmptyStateCard
        message="Your custom foods will appear here"
        footer={
          <VStack style={myFoodsStyles.bottomButton}>
            <Button variant="primary" onPress={onAddFirstFood}>
              Add your first food
            </Button>
          </VStack>
        }
      />
    );
  }

  return (
    <MyFoodsSearchList
      filterQuery={filterQuery}
      onFilterQueryChange={onFilterQueryChange}
      placeholder="Search my foods..."
      data={foods}
      renderItem={renderFoodItem}
      keyExtractor={foodKeyExtractor}
    />
  );
});
