import { useCallback } from "react";
import { Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { VStack } from "@components/layout/VStack";
import { HStack } from "@components/layout/HStack";
import { Body, Caption } from "@components/typography/Text";
import { useTheme } from "@contexts/ThemeProvider";
import { spacing } from "@constants/theme";
import type { CustomMeal } from "@db/schemas";

const styles = StyleSheet.create({
  mealRow: {
    paddingVertical: spacing(1),
  },
  pressed: {
    opacity: 0.7,
  },
});

type CustomMealRowProps = {
  item: CustomMeal;
};

export function CustomMealRow({ item }: CustomMealRowProps) {
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
