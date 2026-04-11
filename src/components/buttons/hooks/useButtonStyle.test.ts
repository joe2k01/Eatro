import { renderHook } from "@testing-library/react-native";
import React, { ReactNode } from "react";
import { ThemeProvider } from "@contexts/ThemeProvider";
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
  it("returns styles for primary variant", () => {
    const { result } = renderHook(
      () => useButtonStyle({ variant: "primary" }),
      { wrapper },
    );
    expect(result.current.containerStyle.backgroundColor).toBeDefined();
    expect(result.current.textStyle.color).toBeDefined();
  });

  it("returns styles for ghost variant", () => {
    const { result } = renderHook(
      () => useButtonStyle({ variant: "ghost" }),
      { wrapper },
    );
    expect(result.current.containerStyle.backgroundColor).toBe("transparent");
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

  it.each(["primary", "secondary", "tertiary", "destructive"] as const)(
    "returns styles for %s variant",
    (variant) => {
      const { result } = renderHook(
        () => useButtonStyle({ variant }),
        { wrapper },
      );
      expect(result.current.containerStyle).toBeDefined();
      expect(result.current.textStyle).toBeDefined();
    },
  );
});
