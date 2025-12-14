import { Avatar } from "@coinbase/cds-mobile/media";
import { SafeVStack } from "../../components";
import { useUser } from "../../contexts/UserContextProvider";
import { Header } from "./components/Header";
import { Box } from "@coinbase/cds-mobile/layout";

export function Settings() {
  const user = useUser();

  return (
    <SafeVStack paddingX={2}>
      <Header />
      <Box paddingTop={10}>
        <Avatar
          colorScheme="red"
          name={user.name ?? "Test"}
          // style={AvatarSize}
          size="xxxl"
          alignSelf="center"
        />
      </Box>
    </SafeVStack>
  );
}

export type SettingsParams = undefined;
