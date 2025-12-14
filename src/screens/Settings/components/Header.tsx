import { Box, HStack } from "@coinbase/cds-mobile/layout";
import { Text } from "@coinbase/cds-mobile/typography/Text";
import { IconButton } from "@coinbase/cds-mobile/buttons/IconButton";
import { useNavigation } from "@react-navigation/native";
import { useCallback } from "react";
import { useCenteredHeader } from "@hooks/useCenteredHeader";

export function Header() {
  const { leftRef, rightRef } = useCenteredHeader();

  const navigation = useNavigation();
  const onGoBack = useCallback(() => navigation.goBack(), [navigation]);

  return (
    <HStack alignItems="center" justifyContent="space-between">
      <Box ref={leftRef}>
        <IconButton name="caretLeft" onPress={onGoBack} transparent />
      </Box>
      <Text font="headline">User configuration</Text>
      <Box ref={rightRef} />
    </HStack>
  );
}
