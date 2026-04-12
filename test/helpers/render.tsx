import { render, RenderOptions } from "@testing-library/react-native";
import { ThemeProvider } from "@contexts/ThemeProvider";
import { ReactElement } from "react";

function AllProviders({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(ui, { wrapper: AllProviders, ...options });
}
