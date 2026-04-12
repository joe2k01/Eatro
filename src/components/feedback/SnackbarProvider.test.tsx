import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Pressable, Text } from "react-native";
import { ThemeProvider } from "@contexts/ThemeProvider";
import type { SnackbarProps } from "./Snackbar";
import { SnackbarProvider, useSnackbar } from "./SnackbarProvider";

const mockSnackbar = jest.fn((_: SnackbarProps) => null);

jest.mock("./Snackbar", () => {
  const actual = jest.requireActual("./Snackbar");
  return {
    ...actual,
    Snackbar: (props: SnackbarProps) => mockSnackbar(props),
  };
});

function getLastSnackbarProps() {
  return mockSnackbar.mock.calls.at(-1)?.[0] as SnackbarProps | undefined;
}

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
  beforeEach(() => {
    mockSnackbar.mockClear();
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
    expect(getLastSnackbarProps()).toEqual(
      expect.objectContaining({
        message: "",
        visible: false,
      }),
    );
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

    expect(getLastSnackbarProps()).toEqual(
      expect.objectContaining({
        message: "hello snack",
        visible: true,
      }),
    );
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

    expect(getLastSnackbarProps()).toEqual(
      expect.objectContaining({
        message: "hello snack",
        visible: true,
      }),
    );

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(getLastSnackbarProps()).toEqual(
      expect.objectContaining({
        message: "hello snack",
        visible: false,
      }),
    );

    jest.useRealTimers();
  });
});
