import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { NavigatorScreenParams } from "@react-navigation/native";
import { Product, ProductParams } from "@screens/Product";
import { Scanner, ScannerParams } from "@screens/Scanner";
import { nestedStackSharedOptions } from "@constants/navigation";
import { useAppStackNavigationOptions } from "@hooks/useAppStackNavigationOptions";
import { AppTabs, TabParamsList } from "./AppTabs";
import { useSQLiteContext } from "expo-sqlite";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";

export type RootStackParamsList = {
  AppTabs: NavigatorScreenParams<TabParamsList>;
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
    <Stack.Navigator initialRouteName="AppTabs" screenOptions={stackOptions}>
      <Stack.Screen
        name="AppTabs"
        component={AppTabs}
        options={nestedStackSharedOptions}
      />
      <Stack.Screen name="Scanner" component={Scanner} />
      <Stack.Screen name="Product" component={Product} />
    </Stack.Navigator>
  );
}
