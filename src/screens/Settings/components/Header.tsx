import { useNavigation } from "@react-navigation/native";
import { useCallback } from "react";
import { useCenteredHeader } from "@hooks/useCenteredHeader";
import { Box } from "@components/layout/Box";
import { HStack } from "@components/layout/HStack";
import { Text } from "@components/typography/Text";
import { IconButton } from "@components/buttons/IconButton";

export function Header() {
  const { leftRef, rightRef } = useCenteredHeader();

  const navigation = useNavigation();
  const onGoBack = useCallback(() => navigation.goBack(), [navigation]);

  return (
    <HStack alignItems="center" justifyContent="space-between">
      <Box ref={leftRef}>
        <IconButton name="chevron-left" onPress={onGoBack} />
      </Box>
      <Text>User configuration</Text>
      <Box ref={rightRef} />
    </HStack>
  );
}
