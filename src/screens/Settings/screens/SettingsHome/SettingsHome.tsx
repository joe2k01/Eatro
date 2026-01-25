import { SafeVStack } from "@components/SafeVStack";
import { Button } from "@components/buttons/Button";
import { Box } from "@components/layout/Box";
import { VStack } from "@components/layout/VStack";
import {
  useTheme,
  useThemeVariant,
  useToggleTheme,
} from "@contexts/ThemeProvider";
import UserSVG from "./components/UserSVG";
import { useUser } from "@contexts/UserContextProvider";
import { Body, Title } from "@components/typography/Text";
import { HStack } from "@components/layout/HStack";
import { IconButton } from "@components/buttons/IconButton";
import { Icon } from "@components/media/Icon";
import { BorderRadius } from "@constants/theme";
import { Switch } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type {
  NativeStackNavigationProp,
  NativeStackNavigationOptions,
} from "@react-navigation/native-stack";
import type { SettingsStackParamsList } from "../../routes";
import { useStaticNavigationOptions } from "@hooks/useStaticNavigationOptions";
import { useMemo } from "react";

export const settingsHomeHeaderOptions = {
  title: "User configuration",
} satisfies NativeStackNavigationOptions;

export function SettingsHome() {
  useStaticNavigationOptions(settingsHomeHeaderOptions);
  const navigation =
    useNavigation<NativeStackNavigationProp<SettingsStackParamsList>>();
  const toggleTheme = useToggleTheme();
  const variant = useThemeVariant();
  const theme = useTheme();
  const switchEnabled = variant === "dark";

  const { name } = useUser();

  const trackColor = useMemo(
    () => ({
      true: theme.semantic.accent,
      false: theme.surface.tertiary,
    }),
    [theme.semantic.accent, theme.surface.tertiary],
  );

  const thumbColor = switchEnabled
    ? theme.semantic.accentForeground
    : theme.text.primary;

  return (
    <SafeVStack paddingHorizontal={2} scrollable>
      <VStack paddingBlock={2} gap={2}>
        <Box width={"50%"} aspectRatio={1} alignSelf="center">
          <UserSVG size={"100%"} />
        </Box>
        <HStack justifyContent="center" alignItems="center" gap={1}>
          <Title>{name ?? "User"}</Title>
          <IconButton name="edit" size="s" variant="secondary" />
        </HStack>
        <Button
          secondaryText="Manage nutrition & fitness goals"
          leftIcon={
            <Box
              backgroundColor={theme.semantic.secondary}
              padding={8}
              borderRadius={BorderRadius.sm}
            >
              <Icon name="outlined-flag" variant="secondary" />
            </Box>
          }
          rightIcon={<Icon name="chevron-right" variant="primary" />}
          onPress={() => navigation.navigate("GoalsConfiguration")}
        >
          Goals configuration
        </Button>
        <HStack justifyContent="space-between" alignItems="center">
          <Body>Use dark theme</Body>
          <Switch
            onChange={toggleTheme}
            value={switchEnabled}
            trackColor={trackColor}
            ios_backgroundColor={theme.surface.tertiary}
            thumbColor={thumbColor}
          />
        </HStack>
      </VStack>
    </SafeVStack>
  );
}
