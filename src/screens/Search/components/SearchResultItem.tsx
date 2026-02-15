import { memo, useCallback, useMemo } from "react";
import { Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { HStack } from "@components/layout/HStack";
import { VStack } from "@components/layout/VStack";
import { Body, Caption } from "@components/typography/Text";
import { RemoteImage } from "@components/media/RemoteImage";
import { useTheme } from "@contexts/ThemeProvider";
import { spacing } from "@constants/theme";
import type { SearchProductItem } from "@api/validators/searchProducts";

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
});

type SearchResultItemProps = {
  item: SearchProductItem;
};

export const SearchResultItem = memo(function SearchResultItem({
  item,
}: SearchResultItemProps) {
  const theme = useTheme();
  const navigation = useNavigation();

  const handlePress = useCallback(() => {
    navigation.navigate("Product", { barcode: item.code });
  }, [navigation, item.code]);

  const imageSource = useMemo(
    () => (item.imageUrl ? { uri: item.imageUrl } : undefined),
    [item.imageUrl],
  );

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => (pressed ? styles.pressed : undefined)}
    >
      <HStack style={styles.row} gap={1.5} alignItems="center">
        <RemoteImage
          source={imageSource}
          shape="squircle"
          style={styles.thumbnail}
        />
        <VStack gap={0.25} flex={1}>
          <Body numberOfLines={1}>{item.name}</Body>
          {item.brand && (
            <Caption color={theme.text.muted}>{item.brand}</Caption>
          )}
        </VStack>
      </HStack>
    </Pressable>
  );
});
