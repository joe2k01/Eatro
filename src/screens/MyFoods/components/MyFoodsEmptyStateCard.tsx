import { useMemo, type ReactNode } from "react";
import { StyleSheet } from "react-native";
import { VStack } from "@components/layout/VStack";
import { Caption } from "@components/typography/Text";
import { useTheme } from "@contexts/ThemeProvider";
import { BorderRadius, spacing } from "@constants/theme";

type MyFoodsEmptyStateCardProps = {
  message: string;
  footer?: ReactNode;
};

export function MyFoodsEmptyStateCard({
  message,
  footer,
}: MyFoodsEmptyStateCardProps) {
  const theme = useTheme();
  const cardStyles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          alignItems: "center",
          borderRadius: BorderRadius.md,
          backgroundColor: theme.surface.secondary,
          padding: spacing(2),
        },
      }),
    [theme.surface.secondary],
  );

  const cardBlock = (
    <VStack>
      <VStack style={cardStyles.card}>
        <Caption color={theme.text.muted}>{message}</Caption>
      </VStack>
    </VStack>
  );

  if (footer != null) {
    return (
      <VStack flex={1} justifyContent="space-between">
        {cardBlock}
        {footer}
      </VStack>
    );
  }

  return <VStack flex={1}>{cardBlock}</VStack>;
}
