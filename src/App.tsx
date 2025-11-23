import { StatusBar } from "expo-status-bar";
import { ThemeProvider } from "@coinbase/cds-mobile";
import { defaultTheme } from "@coinbase/cds-mobile/themes/defaultTheme";
import { NavigationContainer } from "@react-navigation/native";
import { AppRoutes } from "./AppRoutes";
import { useFonts } from "expo-font";

export default function App() {
  const [fontLoaded, fontLoadingError] = useFonts({
    CoibaseIcons: require("@coinbase/cds-icons/esm/fonts/native/CoinbaseIcons.ttf"),
  });

  return (
    <NavigationContainer>
      <ThemeProvider theme={defaultTheme} activeColorScheme="light">
        <AppRoutes />
        <StatusBar style="auto" />
      </ThemeProvider>
    </NavigationContainer>
  );
}
