import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Home, HomeParams } from "./screens/Home";
import { Scanner, ScannerParams } from "./screens/Scanner";
import { Product, ProductParams } from "./screens/Product";

export type RootStackParamsList = {
  Home: HomeParams;
  Scanner: ScannerParams;
  Product: ProductParams;
};

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamsList {}
  }
}

const Stack = createNativeStackNavigator<RootStackParamsList>();

export function AppRoutes() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen
        name="Scanner"
        component={Scanner}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Product" component={Product} />
    </Stack.Navigator>
  );
}
