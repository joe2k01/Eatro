import { Header } from "./components/Header";
import { SafeVStack } from "@components/SafeVStack";
import { Box } from "@components/layout/Box";

export function Settings() {
  // const user = useUser();

  return (
    <SafeVStack paddingHorizontal={2}>
      <Header />
      <Box paddingTop={10}>
        {/* <Avatar
          colorScheme="red"
          name={user.name ?? "Test"}
          // style={AvatarSize}
          size="xxxl"
          alignSelf="center"
        /> */}
      </Box>
    </SafeVStack>
  );
}

export type SettingsParams = undefined;
