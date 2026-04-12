import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Pressable, Text } from "react-native";
import { ThemeProvider } from "@contexts/ThemeProvider";
import { SnackbarProvider, useSnackbar } from "./SnackbarProvider";

declare global {
  var __SNACKBAR_TEST_LAST_VISIBLE__: boolean | undefined;
}

jest.mock("./Snackbar", () => {
  const ReactNs = require("react");
  const { Text: RNText, View: RNView } = require("react-native");
  const { SnackbarVariant } = jest.requireActual("./Snackbar");
  return {
    SnackbarVariant,
    Snackbar: (props: {
      message: string;
      visible: boolean;
      variant?: number;
    }) => {
      globalThis.__SNACKBAR_TEST_LAST_VISIBLE__ = props.visible;
      if (!props.message) {
        return null;
      }
      const label =
        props.variant === SnackbarVariant.Success
          ? "Success"
          : props.variant === SnackbarVariant.Error
            ? "Error"
            : "Info";
      return ReactNs.createElement(
        RNView,
        null,
        ReactNs.createElement(RNText, null, label),
        ReactNs.createElement(RNText, null, props.message),
      );
    },
  };
});

function TestConsumer() {
  const show = useSnackbar();
  return (
    <Pressable
      testID="trigger"
      onPress={() => show({ message: "hello snack" })}
    >
      <Text>trigger</Text>
    </Pressable>
  );
}

describe("SnackbarProvider", () => {
  afterEach(() => {
    delete globalThis.__SNACKBAR_TEST_LAST_VISIBLE__;
  });

  it("renders children", () => {
    render(
      <ThemeProvider>
        <SnackbarProvider>
          <Text>child</Text>
        </SnackbarProvider>
      </ThemeProvider>,
    );
    expect(screen.getByText("child")).toBeOnTheScreen();
  });

  it("shows snackbar when show() called", () => {
    render(
      <ThemeProvider>
        <SnackbarProvider>
          <TestConsumer />
        </SnackbarProvider>
      </ThemeProvider>,
    );

    act(() => {
      fireEvent.press(screen.getByTestId("trigger"));
    });

    expect(screen.getByText("hello snack")).toBeOnTheScreen();
  });

  it("auto-dismisses after timeout", () => {
    jest.useFakeTimers();

    render(
      <ThemeProvider>
        <SnackbarProvider>
          <TestConsumer />
        </SnackbarProvider>
      </ThemeProvider>,
    );

    act(() => {
      fireEvent.press(screen.getByTestId("trigger"));
    });

    expect(screen.getByText("hello snack")).toBeOnTheScreen();
    expect(globalThis.__SNACKBAR_TEST_LAST_VISIBLE__).toBe(true);

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(globalThis.__SNACKBAR_TEST_LAST_VISIBLE__).toBe(false);

    jest.useRealTimers();
  });
});
