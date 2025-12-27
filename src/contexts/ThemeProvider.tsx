import { EatroTheme, ThemeVariant } from "@constants/theme";
import { useStorage } from "@hooks/useStorage";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { Appearance } from "react-native";
import { z } from "zod";

const themeVariantShema = z.literal("light").or(z.literal("dark"));
const defaultThemeVariant = "dark";

const ThemeContext = createContext<{
  theme: ThemeVariant;
  toggleTheme: () => void;
  variant: "light" | "dark";
}>({
  theme: EatroTheme[defaultThemeVariant],
  toggleTheme: () => {},
  variant: defaultThemeVariant,
});

type ThemeProviderProps = {
  children?: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { data, update } = useStorage(
    "theme",
    themeVariantShema,
    defaultThemeVariant,
  );

  useEffect(() => {
    Appearance.setColorScheme(
      typeof data === "object" ? defaultThemeVariant : data,
    );
  }, [data]);

  const variant = data && typeof data === "string" ? data : defaultThemeVariant;

  const ctx = useMemo(() => {
    return {
      theme: EatroTheme[variant],
      variant,
      toggleTheme: () => update(variant === "light" ? "dark" : "light"),
    };
  }, [update, variant]);

  return <ThemeContext.Provider value={ctx}>{children}</ThemeContext.Provider>;
}

// This whole thing should probably use the reducer pattern

function useThemeProvider() {
  const ctx = useContext(ThemeContext);

  if (!ctx) {
    throw new Error("useThemeProvider must be wrapped in a <ThemeProvider />");
  }

  return ctx;
}

export function useTheme() {
  const { theme } = useThemeProvider();

  return theme;
}

export function useToggleTheme() {
  const { toggleTheme } = useThemeProvider();

  return toggleTheme;
}

export function useThemeVariant() {
  const { variant } = useThemeProvider();

  return variant;
}
