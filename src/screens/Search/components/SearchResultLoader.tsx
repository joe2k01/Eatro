import { Fallback } from "@components/feedback";
import { HStack } from "@components/layout/HStack";
import { VStack } from "@components/layout/VStack";
import { StyleSheet } from "react-native";
import { spacing } from "@constants/theme";

const THUMBNAIL_SIZE = 48;

const styles = StyleSheet.create({
  row: {
    paddingVertical: spacing(1),
    paddingHorizontal: spacing(2),
  },
  thumbnail: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
  },
  title: {
    height: 18,
    width: "70%",
  },
  brand: {
    height: 14,
    width: "40%",
  },
});

export const ROW_HEIGHT = THUMBNAIL_SIZE + spacing(2);

export function SearchResultLoader() {
  return (
    <HStack style={styles.row} gap={1.5} alignItems="center">
      <Fallback shape="squircle" style={styles.thumbnail} />
      <VStack gap={0.5} flex={1}>
        <Fallback style={styles.title} />
        <Fallback style={styles.brand} />
      </VStack>
    </HStack>
  );
}
