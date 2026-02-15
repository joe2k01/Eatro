import { SafeVStack } from "@components/SafeVStack";
import { VStack } from "@components/layout/VStack";
import { Caption, Title } from "@components/typography/Text";
import { useTheme } from "@contexts/ThemeProvider";
import { useStaticNavigationOptions } from "@hooks/useStaticNavigationOptions";
import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";

const headerOptions = {
  headerTitle: () => <Title>MealR</Title>,
} satisfies NativeStackNavigationOptions;

export function MealR() {
  useStaticNavigationOptions(headerOptions);
  const theme = useTheme();

  return (
    <SafeVStack guard="bottom" paddingHorizontal={2} paddingTop={1} gap={4}>
      <VStack
        borderRadius={8}
        backgroundColor={theme.surface.secondary}
        padding={2}
        alignItems="center"
      >
        <Caption color={theme.text.muted}>
          Scan items at the supermarket to build meals on the fly
        </Caption>
      </VStack>
    </SafeVStack>
  );
}

export type MealRParams = undefined;
