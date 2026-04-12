import { renderHook } from "@testing-library/react-native";
import React, { ReactNode } from "react";
import { ThemeProvider } from "@contexts/ThemeProvider";
import { EatroTheme } from "@constants/theme";
import { useButtonStyle } from "./useButtonStyle";

jest.mock("@hooks/useStorage", () => ({
  useStorage: () => ({
    data: "dark",
    loading: false,
    reload: jest.fn(),
    update: jest.fn(),
  }),
}));

const wrapper = ({ children }: { children: ReactNode }) =>
  React.createElement(ThemeProvider, undefined, children);

describe("useButtonStyle", () => {
  it("returns styles for ghost variant", () => {
    const { result } = renderHook(() => useButtonStyle({ variant: "ghost" }), {
      wrapper,
    });
    expect(result.current.containerStyle.backgroundColor).toBe("transparent");
    expect(result.current.textStyle.color).toBe(EatroTheme.dark.text.primary);
  });

  it("inverted flips to transparent background with border", () => {
    const { result } = renderHook(
      () => useButtonStyle({ variant: "primary", inverted: true }),
      { wrapper },
    );
    expect(result.current.containerStyle.backgroundColor).toBe("transparent");
    expect(result.current.containerStyle.borderWidth).toBe(1);
  });

  it("disabled sets opacity to 0.5", () => {
    const { result } = renderHook(
      () => useButtonStyle({ variant: "primary", disabled: true }),
      { wrapper },
    );
    expect(result.current.containerStyle.opacity).toBe(0.5);
  });

  it.each([
    {
      variant: "primary" as const,
      backgroundColor: EatroTheme.dark.semantic.primary,
      textColor: EatroTheme.dark.text.inverse,
    },
    {
      variant: "secondary" as const,
      backgroundColor: EatroTheme.dark.surface.secondary,
      textColor: EatroTheme.dark.text.primary,
    },
    {
      variant: "tertiary" as const,
      backgroundColor: EatroTheme.dark.surface.tertiary,
      textColor: EatroTheme.dark.text.secondary,
    },
    {
      variant: "destructive" as const,
      backgroundColor: EatroTheme.dark.semantic.destructive,
      textColor: EatroTheme.dark.text.inverse,
    },
  ])(
    "returns expected colors for $variant variant",
    ({ variant, backgroundColor, textColor }) => {
      const { result } = renderHook(() => useButtonStyle({ variant }), {
        wrapper,
      });

      expect(result.current.containerStyle.backgroundColor).toBe(
        backgroundColor,
      );
      expect(result.current.textStyle.color).toBe(textColor);
    },
  );
});
