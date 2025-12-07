import { StatusBar } from "expo-status-bar";
import { ThemeProvider } from "@coinbase/cds-mobile";
import { defaultTheme } from "@coinbase/cds-mobile/themes/defaultTheme";
import { NavigationContainer } from "@react-navigation/native";
import { AppRoutes } from "./AppRoutes";
import { useFonts } from "expo-font";
import * as Sentry from "@sentry/react-native";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiClientProvier } from "./api/ApiClient";
import { SafeAreaProvider } from "react-native-safe-area-context";

Sentry.init({
  dsn: "https://0b9e10cd50dba3b6a2423d19dc8720fd@o4510450363727872.ingest.de.sentry.io/4510450365038672",

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

const queryClient = new QueryClient();

export default Sentry.wrap(function App() {
  const [_fontLoaded, fontLoadingError] = useFonts({
    CoibaseIcons: require("@coinbase/cds-icons/esm/fonts/native/CoinbaseIcons.ttf"),
  });

  useEffect(() => {
    if (fontLoadingError) {
      Sentry.captureException(fontLoadingError);
    }
  }, [fontLoadingError]);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <QueryClientProvider client={queryClient}>
          <ApiClientProvier>
            <ThemeProvider theme={defaultTheme} activeColorScheme="light">
              <AppRoutes />
              <StatusBar style="auto" />
            </ThemeProvider>
          </ApiClientProvier>
        </QueryClientProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
});
