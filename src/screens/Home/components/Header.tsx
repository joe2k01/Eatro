import { useCallback, useMemo } from "react";
import { useUser } from "../../../contexts/UserContextProvider";
import { format } from "date-fns";
import { Box, HStack } from "@coinbase/cds-mobile/layout";
import { AvatarButton } from "@coinbase/cds-mobile/buttons/AvatarButton";
import { Text } from "@coinbase/cds-mobile/typography/Text";
import { useNavigation } from "@react-navigation/native";
import { useCenteredHeader } from "../../../hooks/useCenteredHeader";

export function Header() {
  const user = useUser();
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
        <AvatarButton
          onPress={onAvatarClick}
          colorScheme="red"
          name={user.name ?? "Test"}
        />
      </Box>
      <Text font="headline">Today, {dateString}</Text>
      <Box ref={rightRef} />
    </HStack>
  );
}
