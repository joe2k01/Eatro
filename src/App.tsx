import { StatusBar } from "expo-status-bar";
import { ThemeProvider } from "@coinbase/cds-mobile";
import { defaultTheme } from "@coinbase/cds-mobile/themes/defaultTheme";
import { VStack } from "@coinbase/cds-mobile/layout/VStack";
import { Text } from "@coinbase/cds-mobile/typography/Text";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { AppRoutes } from "./AppRoutes";

export default function App() {
  return (
    <NavigationContainer>
      <ThemeProvider theme={defaultTheme} activeColorScheme="light">
        <AppRoutes />
        <StatusBar style="auto" />
      </ThemeProvider>
    </NavigationContainer>
  );
}
