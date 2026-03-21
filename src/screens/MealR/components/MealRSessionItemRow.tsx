import { Pressable, StyleSheet } from "react-native";
import { VStack } from "@components/layout/VStack";
import { HStack } from "@components/layout/HStack";
import { Body, Caption } from "@components/typography/Text";
import { Icon } from "@components/media/Icon";
import { useTheme } from "@contexts/ThemeProvider";
import { spacing } from "@constants/theme";
import type { MealRSessionItem } from "../types";

const styles = StyleSheet.create({
  row: {
    paddingVertical: spacing(1),
  },
  pressed: {
    opacity: 0.7,
  },
});

export type MealRSessionItemRowProps = {
  item: MealRSessionItem;
  onEdit: () => void;
  onDelete: () => void;
};

export function MealRSessionItemRow({
  item,
  onEdit,
  onDelete,
}: MealRSessionItemRowProps) {
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
          <Icon name="close" size="s" color={theme.text.primary} />
        </Pressable>
      </HStack>
    </Pressable>
  );
}
