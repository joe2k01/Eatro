import { memo, useCallback, useMemo, type ReactNode } from "react";
import { Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { HStack } from "@components/layout/HStack";
import { VStack } from "@components/layout/VStack";
import { Body, Caption } from "@components/typography/Text";
import { RemoteImage } from "@components/media/RemoteImage";
import { Icon } from "@components/media/Icon";
import { useTheme } from "@contexts/ThemeProvider";
import { spacing, BorderRadius } from "@constants/theme";
import type { SearchProductItem } from "@api/validators/searchProducts";
import type { Food } from "@db/schemas";

const THUMBNAIL_SIZE = 48;

const styles = StyleSheet.create({
  row: {
    paddingVertical: spacing(1),
    paddingHorizontal: spacing(2),
  },
  pressed: {
    opacity: 0.7,
  },
  thumbnail: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
  },
  iconPlaceholder: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: BorderRadius.md,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
});

export type SearchResultItemProps =
  | { item: SearchProductItem; source: "api" }
  | { item: Food; source: "local" };

export const SearchResultItem = memo(function SearchResultItem(
  props: SearchResultItemProps,
) {
  const { source } = props;
  const theme = useTheme();
  const navigation = useNavigation();

  const name = source === "api" ? props.item.name : props.item.name;
  const brand =
    source === "api" ? props.item.brand : (props.item.brand ?? undefined);

  const handlePress = useCallback(() => {
    switch (source) {
      case "api":
        navigation.navigate("Product", {
          barcode: (props.item as SearchProductItem).code,
        });
        break;
      case "local":
        navigation.navigate("Product", {
          foodId: (props.item as Food).id,
        });
        break;
    }
  }, [navigation, props.item, source]);

  const nutrimentSummary: ReactNode = useMemo(() => {
    if (source !== "local") return null;
    const food = props.item as Food;
    return (
      <Caption color={theme.text.muted}>
        {Math.round(food.energy_per_serving)} kcal · P:{" "}
        {Math.round(food.proteins_per_serving)}g C:{" "}
        {Math.round(food.carbohydrates_per_serving)}g F:{" "}
        {Math.round(food.fat_per_serving)}g
      </Caption>
    );
  }, [source, props.item, theme.text.muted]);

  const imageSource = useMemo(
    () =>
      source === "api" && (props.item as SearchProductItem).imageUrl
        ? { uri: (props.item as SearchProductItem).imageUrl }
        : undefined,
    [props.item, source],
  );

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => (pressed ? styles.pressed : undefined)}
    >
      <HStack style={styles.row} gap={1.5} alignItems="center">
        {imageSource ? (
          <RemoteImage
            source={imageSource}
            shape="squircle"
            style={styles.thumbnail}
          />
        ) : (
          <VStack
            style={[
              styles.iconPlaceholder,
              { backgroundColor: theme.surface.tertiary },
            ]}
          >
            <Icon
              community
              name="food-apple"
              size="s"
              color={theme.text.muted}
            />
          </VStack>
        )}
        <VStack gap={0.25} flex={1}>
          <Body numberOfLines={1}>{name}</Body>
          {brand && <Caption color={theme.text.muted}>{brand}</Caption>}
          {nutrimentSummary}
        </VStack>
      </HStack>
    </Pressable>
  );
});
