import { useCallback, useMemo } from "react";
import { format } from "date-fns";
import { useNavigation } from "@react-navigation/native";
import { useCenteredHeader } from "@hooks/useCenteredHeader";
import { HStack } from "@components/layout/HStack";
import { Box } from "@components/layout/Box";
import { TextBody } from "@components/typography/Text";
import { IconButton } from "@components/buttons/IconButton";

export function Header() {
  const dateString = useMemo(() => format(new Date(), "MMMM do"), []);

  const navigation = useNavigation();
  const onAvatarClick = useCallback(
    () => navigation.navigate("Settings"),
    [navigation],
  );

  const { leftRef, rightRef } = useCenteredHeader();

  return (
    <HStack alignItems="center" justifyContent="space-between">
      <Box ref={leftRef}>
        <IconButton name="person" onPress={onAvatarClick} />
      </Box>
      <TextBody>Today, {dateString}</TextBody>
      <Box ref={rightRef} />
    </HStack>
  );
}
