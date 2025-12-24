import {
  createNativeStackNavigator,
  NativeStackNavigationOptions,
} from "@react-navigation/native-stack";
import { Home, HomeParams } from "@screens/Home";
import {
  Product,
  ProductLoader,
  ProductLoaderParams,
  ProductParams,
} from "@screens/Product";
import { Scanner, ScannerParams } from "@screens/Scanner";
import { Settings, SettingsParams } from "@screens/Settings";
import { Header } from "@components/navigation/Header";

export type RootStackParamsList = {
  Home: HomeParams;
  Settings: SettingsParams;
  Scanner: ScannerParams;
  Product: ProductParams;
  ProductLoader: ProductLoaderParams;
};

export type RouteNames = keyof RootStackParamsList;

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamsList {}
  }
}

const Stack = createNativeStackNavigator<RootStackParamsList>();

const StackOptions: NativeStackNavigationOptions = {
  headerShown: true,
  header: Header,
};

export function AppRoutes() {
  return (
    <Stack.Navigator initialRouteName="Home" screenOptions={StackOptions}>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="Scanner" component={Scanner} />
      <Stack.Screen name="Product" component={Product} />
      <Stack.Screen name="ProductLoader" component={ProductLoader} />
    </Stack.Navigator>
  );
}
