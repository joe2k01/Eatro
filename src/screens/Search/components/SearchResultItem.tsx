import { memo, useCallback, useMemo, type ReactNode } from "react";
import { Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { match } from "ts-pattern";
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
  const theme = useTheme();
  const navigation = useNavigation();

  const handlePress = useCallback(() => {
    match(props)
      .with({ source: "api" }, ({ item }) => {
        navigation.navigate("Product", { barcode: item.code });
      })
      .with({ source: "local" }, ({ item }) => {
        navigation.navigate("Product", { foodId: item.id });
      })
      .exhaustive();
  }, [navigation, props]);

  const { name, brand, imageSource, nutrimentSummary } = useMemo(() => {
    return match(props)
      .with({ source: "api" }, ({ item }) => ({
        name: item.name,
        brand: item.brand,
        imageSource: item.imageUrl ? { uri: item.imageUrl } as const : undefined,
        nutrimentSummary: null as ReactNode,
      }))
      .with({ source: "local" }, ({ item }) => ({
        name: item.name,
        brand: item.brand ?? undefined,
        imageSource: undefined,
        nutrimentSummary: (
          <Caption color={theme.text.muted}>
            {Math.round(item.energy_per_serving)} kcal · P:{" "}
            {Math.round(item.proteins_per_serving)}g C:{" "}
            {Math.round(item.carbohydrates_per_serving)}g F:{" "}
            {Math.round(item.fat_per_serving)}g
          </Caption>
        ),
      }))
      .exhaustive();
  }, [props, theme.text.muted]);

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
