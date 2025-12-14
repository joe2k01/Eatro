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
}>({ theme: EatroTheme[defaultThemeVariant], toggleTheme: () => {} });

type ThemeProviderProps = {
  children?: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { data, storageApi } = useStorage("theme", themeVariantShema);

  useEffect(() => {
    storageApi.current?.load();
  }, [storageApi]);

  useEffect(() => {
    Appearance.setColorScheme(
      typeof data === "object" ? defaultThemeVariant : data,
    );
  }, [data]);

  const variant = data && typeof data === "string" ? data : defaultThemeVariant;

  const ctx = useMemo(() => {
    return {
      theme: EatroTheme[variant],
      toggleTheme: () =>
        storageApi.current?.store(variant === "light" ? "dark" : "light"),
    };
  }, [storageApi, variant]);

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
