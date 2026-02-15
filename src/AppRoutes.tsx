import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Product, ProductParams } from "@screens/Product";
import { Scanner, ScannerParams } from "@screens/Scanner";
import { SettingsNavigator, SettingsNavigatorParams } from "@screens/Settings";
import { nestedStackSharedOptions } from "@constants/navigation";
import { useAppStackNavigationOptions } from "@hooks/useAppStackNavigationOptions";
import { MainTabs } from "./MainTabs";
import { useSQLiteContext } from "expo-sqlite";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";

export type RootStackParamsList = {
  MainTabs: undefined;
  Settings: SettingsNavigatorParams;
  Scanner: ScannerParams;
  Product: ProductParams;
};

export type RouteNames = keyof RootStackParamsList;

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamsList {}
  }
}

const Stack = createNativeStackNavigator<RootStackParamsList>();

export function AppRoutes() {
  const stackOptions = useAppStackNavigationOptions();

  const db = useSQLiteContext();
  useDrizzleStudio(db);

  return (
    <Stack.Navigator initialRouteName="MainTabs" screenOptions={stackOptions}>
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={nestedStackSharedOptions}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsNavigator}
        options={nestedStackSharedOptions}
      />
      <Stack.Screen name="Scanner" component={Scanner} />
      <Stack.Screen name="Product" component={Product} />
    </Stack.Navigator>
  );
}
