import type { RefObject } from "react";
import { screen, waitFor } from "@testing-library/react-native";
import type { TrayApi } from "@components/layout/Tray";
import { renderWithProviders } from "../../../test/helpers/render";
import { ConfirmDeleteTray } from "./ConfirmDeleteTray";

const mockCloseTray = jest.fn().mockResolvedValue(undefined);

const mockButton = jest.fn(
  ({ children }: { children?: unknown }) => children ?? null,
);

jest.mock("@components/layout/Tray", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    Tray: React.forwardRef(function MockTray(
      { children }: { children?: unknown },
      ref: unknown,
    ) {
      React.useImperativeHandle(ref, () => ({
        openTray: jest.fn(),
        closeTray: mockCloseTray,
      }));
      return React.createElement(View, null, children);
    }),
  };
});

jest.mock("@components/buttons/Button", () => ({
  Button: (props: unknown) => mockButton(props),
}));

type MockButtonProps = {
  children?: unknown;
  variant?: string;
  onPress?: () => Promise<void> | void;
};

function createTrayRef() {
  return {
    trayRef: {
      current: null,
    } as RefObject<TrayApi | null>,
  };
}

describe("ConfirmDeleteTray", () => {
  beforeEach(() => {
    mockButton.mockClear();
    mockCloseTray.mockClear();
  });

  it("renders food name in confirmation message", () => {
    const { trayRef } = createTrayRef();
    renderWithProviders(
      <ConfirmDeleteTray
        trayRef={trayRef}
        foodName="Banana"
        onConfirm={jest.fn(async () => {})}
        onCancel={jest.fn()}
      />,
    );
    expect(screen.getByText(/Banana/)).toBeOnTheScreen();
  });

  it("renders confirm and cancel buttons", () => {
    const { trayRef } = createTrayRef();
    renderWithProviders(
      <ConfirmDeleteTray
        trayRef={trayRef}
        foodName="Apple"
        onConfirm={jest.fn(async () => {})}
        onCancel={jest.fn()}
      />,
    );
    const labels = mockButton.mock.calls.map(
      ([props]) => (props as MockButtonProps).children,
    );
    expect(labels).toEqual(expect.arrayContaining(["Yes, remove", "Cancel"]));
  });

  it("calls onConfirm and closeTray when confirm is pressed", async () => {
    const { trayRef } = createTrayRef();
    const onConfirm = jest.fn().mockResolvedValue(undefined);

    renderWithProviders(
      <ConfirmDeleteTray
        trayRef={trayRef}
        foodName="Apple"
        onConfirm={onConfirm}
        onCancel={jest.fn()}
      />,
    );

    const confirmButtonProps = mockButton.mock.calls
      .map(([props]) => props as MockButtonProps)
      .find((props) => props.children === "Yes, remove");

    expect(confirmButtonProps?.onPress).toEqual(expect.any(Function));
    confirmButtonProps?.onPress?.();

    expect(onConfirm).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(mockCloseTray).toHaveBeenCalledTimes(1);
    });
  });

  it("calls onCancel and closeTray when cancel is pressed", async () => {
    const { trayRef } = createTrayRef();
    const onCancel = jest.fn();

    renderWithProviders(
      <ConfirmDeleteTray
        trayRef={trayRef}
        foodName="Apple"
        onConfirm={jest.fn().mockResolvedValue(undefined)}
        onCancel={onCancel}
      />,
    );

    const cancelButtonProps = mockButton.mock.calls
      .map(([props]) => props as MockButtonProps)
      .find((props) => props.children === "Cancel");

    expect(cancelButtonProps?.onPress).toEqual(expect.any(Function));
    cancelButtonProps?.onPress?.();

    expect(onCancel).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(mockCloseTray).toHaveBeenCalledTimes(1);
    });
  });
});
