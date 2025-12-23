import { Header } from "./components/Header";
import { SafeVStack } from "@components/SafeVStack";
import { Button } from "@components/buttons/Button";
import { Box } from "@components/layout/Box";
import { VStack } from "@components/layout/VStack";
import { useTheme, useToggleTheme } from "@contexts/ThemeProvider";
import UserSVG from "./components/UserSVG";

export function Settings() {
  const { fg } = useTheme();
  const toggleTheme = useToggleTheme();

  return (
    <SafeVStack paddingHorizontal={2}>
      <Header />
      <VStack paddingTop={2}>
        <Button variant="primary" onPress={toggleTheme}>
          Toggle Theme
        </Button>
      </VStack>
      <Box paddingTop={10} alignItems="center">
        <UserSVG color={fg} size={"50%"} />
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
