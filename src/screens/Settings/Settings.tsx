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
    <SafeVStack paddingHorizontal={2} scrollable>
      <VStack>
        <Button variant="primary" onPress={toggleTheme}>
          Toggle Theme
        </Button>
      </VStack>
      <Box
        alignItems="center"
        width={"100%"}
        aspectRatio={1}
        backgroundColor={"green"}
      >
        <UserSVG color={fg} size={"100%"} />
      </Box>
    </SafeVStack>
  );
}

export type SettingsParams = undefined;
