import {
  KeyboardAvoidingView,
  KeyboardAvoidingViewProps,
  Platform,
} from "react-native";
import { useTheme } from "@contexts/ThemeProvider";
import { useMemo } from "react";

const props: KeyboardAvoidingViewProps = {
  behavior: Platform.OS === "ios" ? "padding" : "height",
};

export function KeyboardView({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const style = useMemo(
    () => ({ backgroundColor: theme.surface.primary }),
    [theme.surface.primary],
  );

  return (
    <KeyboardAvoidingView {...props} style={style}>
      {children}
    </KeyboardAvoidingView>
  );
}
