import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Home, HomeParams } from "./screens/Home";
import { Scanner, ScannerParams } from "./screens/Scanner";

export type RootStackParamsList = {
  Home: HomeParams;
  Scanner: ScannerParams;
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
    </Stack.Navigator>
  );
}
