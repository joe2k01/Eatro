import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GoalsConfiguration } from "./GoalsConfiguration";
import { Settings } from "./Settings";
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
      <Stack.Screen name="SettingsHome" component={Settings} />
      <Stack.Screen name="GoalsConfiguration" component={GoalsConfiguration} />
    </Stack.Navigator>
  );
}

export type SettingsNavigatorParams = undefined;
