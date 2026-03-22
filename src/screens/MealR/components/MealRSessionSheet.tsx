import { useCallback, useMemo } from "react";
import { StyleSheet } from "react-native";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { useTheme } from "@contexts/ThemeProvider";
import { spacing } from "@constants/theme";
import { VStack } from "@components/layout/VStack";
import { Button } from "@components/buttons/Button";
import type { MealRSessionItem } from "../types";
import { useMealRSession } from "../MealRSessionProvider";
import { MealRSummary } from "./MealRSummary";
import { MealRSessionItemRow } from "./MealRSessionItemRow";

const SNAP_POINTS = ["26%", "62%"] as const;

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: spacing(2),
    paddingBottom: spacing(2),
  },
});

export function MealRSessionSheet() {
  const { items, totals, deleteItem, setFlow } = useMealRSession();
  const theme = useTheme();

  const onEditItem = useCallback(
    (item: MealRSessionItem) => {
      setFlow({ kind: "edit", item });
    },
    [setFlow],
  );

  const renderItem = useCallback(
    ({ item }: { item: MealRSessionItem }) => (
      <MealRSessionItemRow
        item={item}
        onEdit={() => onEditItem(item)}
        onDelete={() => deleteItem(item.id)}
      />
    ),
    [deleteItem, onEditItem],
  );

  const keyExtractor = useCallback((item: MealRSessionItem) => item.id, []);

  const ListHeader = useMemo(
    () => (
      <VStack gap={1} backgroundColor="transparent" paddingBottom={1}>
        <MealRSummary totals={totals} itemCount={items.length} />
        <Button
          variant="primary"
          onPress={() => setFlow({ kind: "save" })}
          disabled={items.length === 0}
        >
          Save meal
        </Button>
      </VStack>
    ),
    [items.length, setFlow, totals],
  );

  return (
    <BottomSheet
      index={0}
      snapPoints={[...SNAP_POINTS]}
      enableDynamicSizing={false}
      enablePanDownToClose={false}
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
