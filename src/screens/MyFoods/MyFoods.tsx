import { useCallback, useMemo, useState } from "react";
import { FlatList, ListRenderItemInfo, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type {
  NativeStackNavigationOptions,
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import { SafeVStack } from "@components/SafeVStack";
import { VStack } from "@components/layout/VStack";
import { Caption, Title } from "@components/typography/Text";
import { TextInput } from "@components/forms";
import { Button } from "@components/buttons/Button";
import { IconButton } from "@components/buttons/IconButton";
import { useTheme } from "@contexts/ThemeProvider";
import { useDynamicNavigationOptions } from "@hooks/useDynamicNavigationOptions";
import { spacing } from "@constants/theme";
import type { Food } from "@db/schemas";
import { SearchResultItem } from "@screens/Search/components/SearchResultItem";
import { useManualFoods } from "./hooks/useManualFoods";
import type { MyFoodsStackParamsList } from "../../AppTabs";

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
});

export function MyFoods() {
  const theme = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<MyFoodsStackParamsList>>();

  const [filterQuery, setFilterQuery] = useState("");
  const foods = useManualFoods(filterQuery);

  const navigateToCreateFood = useCallback(() => {
    navigation.navigate("CreateFood");
  }, [navigation]);

  const headerOptions = useMemo<NativeStackNavigationOptions>(
    () => ({
      headerTitle: () => <Title>My Foods</Title>,
      headerRight: () => (
        <IconButton
          name="add"
          variant="tertiary"
          onPress={navigateToCreateFood}
        />
      ),
    }),
    [navigateToCreateFood],
  );
  useDynamicNavigationOptions(headerOptions);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Food>) => (
      <SearchResultItem item={item} source="local" />
    ),
    [],
  );

  const keyExtractor = useCallback((item: Food) => String(item.id), []);

  const isEmpty = foods.length === 0 && !filterQuery.trim();

  return (
    <SafeVStack guard="bottom" flex={1} paddingTop={1}>
      {isEmpty ? (
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
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            keyboardShouldPersistTaps="handled"
          />
        </VStack>
      )}
    </SafeVStack>
  );
}

export type MyFoodsParams = undefined;
