import { useMemo } from "react";
import { format } from "date-fns";
// import { AvatarButton } from "@coinbase/cds-mobile/buttons/AvatarButton";
// import { useNavigation } from "@react-navigation/native";
import { useCenteredHeader } from "@hooks/useCenteredHeader";
import { HStack } from "@components/layout/HStack";
import { Box } from "@components/layout/Box";
import { Text } from "@components/typography/Text";

export function Header() {
  // const user = useUser();
  const dateString = useMemo(() => format(new Date(), "MMMM do"), []);

  // const navigation = useNavigation();
  // const onAvatarClick = useCallback(
  //   () => navigation.navigate("Settings"),
  //   [navigation],
  // );

  const { leftRef, rightRef } = useCenteredHeader();

  return (
    <HStack alignItems="center" justifyContent="space-between">
      <Box ref={leftRef}>
        {/* <AvatarButton
          onPress={onAvatarClick}
          colorScheme="red"
          name={user.name ?? "Test"}
        /> */}
      </Box>
      <Text color={"black"}>Today, {dateString}</Text>
      <Box ref={rightRef} />
    </HStack>
  );
}
