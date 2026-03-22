import { FlatList, type ListRenderItem } from "react-native";
import { VStack } from "@components/layout/VStack";
import { TextInput } from "@components/forms";
import { myFoodsStyles } from "../constants/styles";

type MyFoodsSearchListProps<T> = {
  filterQuery: string;
  onFilterQueryChange: (value: string) => void;
  placeholder: string;
  data: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor: (item: T, index: number) => string;
};

export function MyFoodsSearchList<T>({
  filterQuery,
  onFilterQueryChange,
  placeholder,
  data,
  renderItem,
  keyExtractor,
}: MyFoodsSearchListProps<T>) {
  return (
    <VStack flex={1} gap={1} paddingHorizontal={2} paddingTop={1}>
      <TextInput
        value={filterQuery}
        onChangeText={onFilterQueryChange}
        placeholder={placeholder}
      />
      <FlatList
        style={myFoodsStyles.list}
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        keyboardShouldPersistTaps="handled"
      />
    </VStack>
  );
}
