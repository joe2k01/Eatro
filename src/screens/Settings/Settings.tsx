import { Header } from "./components/Header";
import { SafeVStack } from "@components/SafeVStack";
import { Button } from "@components/buttons/Button";
import { Box } from "@components/layout/Box";
import { VStack } from "@components/layout/VStack";
import { useToggleTheme } from "@contexts/ThemeProvider";

export function Settings() {
  const toggleTheme = useToggleTheme();

  return (
    <SafeVStack paddingHorizontal={2}>
      <Header />
      <VStack paddingTop={2}>
        <Button variant="primary" onPress={toggleTheme}>
          Toggle Theme
        </Button>
      </VStack>
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
