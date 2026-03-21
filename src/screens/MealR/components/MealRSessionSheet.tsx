import { useCallback, useMemo } from "react";
import { StyleSheet } from "react-native";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { useTheme } from "@contexts/ThemeProvider";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { spacing } from "@constants/theme";
import { VStack } from "@components/layout/VStack";
import { Button } from "@components/buttons/Button";
import type { MealRSessionItem, MealRSessionTotals } from "../types";
import { MealRSummary } from "./MealRSummary";
import { MealRDrawerItem } from "./MealRDrawer";

const SNAP_POINTS = ["26%", "62%"] as const;

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: spacing(2),
    paddingBottom: spacing(2),
  },
});

type MealRSessionSheetProps = {
  items: MealRSessionItem[];
  totals: MealRSessionTotals;
  onEditItem: (item: MealRSessionItem) => void;
  onDeleteItem: (itemId: string) => void;
  onPressSaveMeal: () => void;
};

export function MealRSessionSheet({
  items,
  totals,
  onEditItem,
  onDeleteItem,
  onPressSaveMeal,
}: MealRSessionSheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const renderItem = useCallback(
    ({ item }: { item: MealRSessionItem }) => (
      <MealRDrawerItem
        item={item}
        onEdit={() => onEditItem(item)}
        onDelete={() => onDeleteItem(item.id)}
      />
    ),
    [onDeleteItem, onEditItem],
  );

  const keyExtractor = useCallback((item: MealRSessionItem) => item.id, []);

  const ListHeader = useMemo(
    () => (
      <VStack gap={1} backgroundColor="transparent" paddingBottom={1}>
        <MealRSummary totals={totals} itemCount={items.length} />
        <Button
          variant="primary"
          onPress={onPressSaveMeal}
          disabled={items.length === 0}
        >
          Save meal
        </Button>
      </VStack>
    ),
    [items.length, onPressSaveMeal, totals],
  );

  return (
    <BottomSheet
      index={0}
      snapPoints={[...SNAP_POINTS]}
      enableDynamicSizing={false}
      enablePanDownToClose={false}
      bottomInset={insets.bottom}
      backgroundStyle={{ backgroundColor: theme.surface.secondary }}
      handleIndicatorStyle={{
        backgroundColor: theme.text.muted,
        width: 40,
      }}
    >
      <BottomSheetFlatList
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
      />
    </BottomSheet>
  );
}
