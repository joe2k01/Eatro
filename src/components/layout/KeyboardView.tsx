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
  const { bg } = useTheme();
  const style = useMemo(() => ({ backgroundColor: bg }), [bg]);

  return (
    <KeyboardAvoidingView {...props} style={style}>
      {children}
    </KeyboardAvoidingView>
  );
}
