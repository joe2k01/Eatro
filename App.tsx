import { StatusBar } from "expo-status-bar";
import { ThemeProvider } from "@coinbase/cds-mobile";
import { defaultTheme } from "@coinbase/cds-mobile/themes/defaultTheme";
import { VStack } from "@coinbase/cds-mobile/layout/VStack";
import { Text } from "@coinbase/cds-mobile/typography/Text";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function App() {
  return (
    <ThemeProvider theme={defaultTheme} activeColorScheme="light">
      <SafeAreaProvider>
        <SafeAreaView>
          <VStack background="accentBoldRed">
            <Text>Open up App.tsx to start working on your app!</Text>
          </VStack>
        </SafeAreaView>
      </SafeAreaProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
