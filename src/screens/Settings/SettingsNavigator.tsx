import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GoalsConfiguration } from "./screens/GoalsConfiguration";
import { SettingsHome } from "./screens/SettingsHome";
import type { SettingsStackParamsList } from "./routes";

import { createAppStackNavigationOptions } from "@constants/navigation";

const Stack = createNativeStackNavigator<SettingsStackParamsList>();

const SettingsStackOptions = createAppStackNavigationOptions();

export function SettingsNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="SettingsHome"
      screenOptions={SettingsStackOptions}
    >
      <Stack.Screen name="SettingsHome" component={SettingsHome} />
      <Stack.Screen name="GoalsConfiguration" component={GoalsConfiguration} />
    </Stack.Navigator>
  );
}

export type SettingsNavigatorParams = undefined;
