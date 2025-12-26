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
import { TextBody, Title1 } from "@components/typography/Text";
import { HStack } from "@components/layout/HStack";
import { IconButton } from "@components/buttons/IconButton";
import { Icon } from "@components/media/Icon";
import { useThemeDimension } from "@hooks/useThemeDimension";
import { Switch } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { SettingsStackParamsList } from "../../routes";
import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { useStaticNavigationOptions } from "@hooks/useStaticNavigationOptions";

export const settingsHomeHeaderOptions = {
  title: "User configuration",
} satisfies NativeStackNavigationOptions;

export function SettingsHome() {
  useStaticNavigationOptions(settingsHomeHeaderOptions);
  const navigation =
    useNavigation<NativeStackNavigationProp<SettingsStackParamsList>>();
  const toggleTheme = useToggleTheme();
  const variant = useThemeVariant();
  const { secondary, popover, fgPopover, accent, fgAccent } = useTheme();
  const switchEnabled = variant === "dark";

  const iconBorderRadius = useThemeDimension(0.5);

  const { name } = useUser();

  return (
    <SafeVStack paddingHorizontal={2} scrollable>
      <VStack paddingBlock={2} gap={2}>
        <Box width={"50%"} aspectRatio={1} alignSelf="center">
          <UserSVG size={"100%"} />
        </Box>
        <HStack justifyContent="center" alignItems="center" gap={1}>
          <Title1>{name ?? "User"}</Title1>
          <IconButton name="edit" size="s" variant="secondary" />
        </HStack>
        <Button
          textAlign="left"
          secondaryText="Manage nutrition & fitness goals"
          leftIcon={
            <Box
              backgroundColor={secondary}
              padding={1}
              borderRadius={iconBorderRadius}
            >
              <Icon name="outlined-flag" variant="secondary" />
            </Box>
          }
          rightIcon={<Icon name="chevron-right" variant="primary" />}
          justifyContent="space-between"
          onPress={() => navigation.navigate("GoalsConfiguration")}
        >
          Goals configuration
        </Button>
        <HStack justifyContent="space-between" alignItems="center">
          <TextBody>Use dark theme</TextBody>
          <Switch
            onChange={toggleTheme}
            value={switchEnabled}
            trackColor={{ true: accent, false: popover }}
            ios_backgroundColor={popover}
            thumbColor={switchEnabled ? fgAccent : fgPopover}
          />
        </HStack>
      </VStack>
    </SafeVStack>
  );
}


