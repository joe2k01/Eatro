import { useCallback, useMemo } from "react";
import { FlatList, Pressable, StyleSheet } from "react-native";
import { VStack } from "@components/layout/VStack";
import { HStack } from "@components/layout/HStack";
import { Body, Caption } from "@components/typography/Text";
import { Icon } from "@components/media/Icon";
import { useTheme } from "@contexts/ThemeProvider";
import { spacing } from "@constants/theme";
import type { MealRSessionItem, MealRSessionTotals } from "../types";
import { MealRSummary } from "./MealRSummary";

type MealRDrawerProps = {
  items: MealRSessionItem[];
  totals: MealRSessionTotals;
  onEditItem: (item: MealRSessionItem) => void;
  onDeleteItem: (itemId: string) => void;
};

const styles = StyleSheet.create({
  list: {
    maxHeight: 200,
  },
  row: {
    paddingVertical: spacing(1),
  },
  pressed: {
    opacity: 0.7,
  },
});

function MealRDrawerItem({
  item,
  onEdit,
  onDelete,
}: {
  item: MealRSessionItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onEdit}
      style={({ pressed }) => (pressed ? styles.pressed : undefined)}
    >
      <HStack
        style={styles.row}
        justifyContent="space-between"
        alignItems="center"
        backgroundColor="transparent"
      >
        <VStack flex={1} backgroundColor="transparent">
          <Body numberOfLines={1}>{item.name}</Body>
          <Caption color={theme.text.muted}>
            {item.quantity} × {item.servingSize}
            {item.servingsUnit ?? "g"} · {Math.round(item.energy)} kcal
          </Caption>
        </VStack>
        <Pressable onPress={onDelete} hitSlop={8}>
          <Icon name="close" size="s" variant="destructive" />
        </Pressable>
      </HStack>
    </Pressable>
  );
}

export function MealRDrawer({
  items,
  totals,
  onEditItem,
  onDeleteItem,
}: MealRDrawerProps) {
  const renderItem = useCallback(
    ({ item }: { item: MealRSessionItem }) => (
      <MealRDrawerItem
        item={item}
        onEdit={() => onEditItem(item)}
        onDelete={() => onDeleteItem(item.id)}
      />
    ),
    [onEditItem, onDeleteItem],
  );

  const keyExtractor = useCallback((item: MealRSessionItem) => item.id, []);

  const hasItems = items.length > 0;

  const theme = useTheme();

  const listStyle = useMemo(
    () => [styles.list, { borderTopColor: theme.surface.tertiary }],
    [theme.surface.tertiary],
  );

  if (!hasItems) {
    return <MealRSummary totals={totals} itemCount={0} />;
  }

  return (
    <VStack gap={1} backgroundColor="transparent">
      <MealRSummary totals={totals} itemCount={items.length} />
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        style={listStyle}
        keyboardShouldPersistTaps="handled"
      />
    </VStack>
  );
}
