import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GoalsConfiguration } from "./screens/GoalsConfiguration";
import { SettingsHome } from "./screens/SettingsHome";
import type { SettingsStackParamsList } from "./routes";
import { useAppStackNavigationOptions } from "@hooks/useAppStackNavigationOptions";

const Stack = createNativeStackNavigator<SettingsStackParamsList>();

export function SettingsNavigator() {
  const stackOptions = useAppStackNavigationOptions();

  return (
    <Stack.Navigator
      initialRouteName="SettingsHome"
      screenOptions={stackOptions}
    >
      <Stack.Screen name="SettingsHome" component={SettingsHome} />
      <Stack.Screen name="GoalsConfiguration" component={GoalsConfiguration} />
    </Stack.Navigator>
  );
}

export type SettingsNavigatorParams = undefined;
