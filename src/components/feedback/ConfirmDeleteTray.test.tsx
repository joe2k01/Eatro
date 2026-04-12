import { useRef } from "react";
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import type { TrayApi } from "@components/layout/Tray";
import { renderWithProviders } from "../../../test/helpers/render";
import {
  ConfirmDeleteTray,
  type ConfirmDeleteTrayProps,
} from "./ConfirmDeleteTray";

function TestConfirmDeleteTray(props: Omit<ConfirmDeleteTrayProps, "trayRef">) {
  const trayRef = useRef<TrayApi | null>(null);
  return <ConfirmDeleteTray {...props} trayRef={trayRef} />;
}

describe("ConfirmDeleteTray", () => {
  it("renders food name in confirmation message", () => {
    renderWithProviders(
      <TestConfirmDeleteTray
        foodName="Banana"
        onConfirm={jest.fn(async () => {})}
        onCancel={jest.fn()}
      />,
    );
    expect(screen.getByText(/Banana/)).toBeOnTheScreen();
  });

  it("renders confirm and cancel buttons", () => {
    renderWithProviders(
      <TestConfirmDeleteTray
        foodName="Apple"
        onConfirm={jest.fn(async () => {})}
        onCancel={jest.fn()}
      />,
    );
    expect(screen.getByText("Yes, remove")).toBeOnTheScreen();
    expect(screen.getByText("Cancel")).toBeOnTheScreen();
  });

  it("calls onConfirm when confirm is pressed", async () => {
    const onConfirm = jest.fn().mockResolvedValue(undefined);

    renderWithProviders(
      <TestConfirmDeleteTray
        foodName="Apple"
        onConfirm={onConfirm}
        onCancel={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByText("Yes, remove"));

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });
  });

  it("calls onCancel when cancel is pressed", async () => {
    const onCancel = jest.fn();

    renderWithProviders(
      <TestConfirmDeleteTray
        foodName="Apple"
        onConfirm={jest.fn().mockResolvedValue(undefined)}
        onCancel={onCancel}
      />,
    );

    fireEvent.press(screen.getByText("Cancel"));

    await waitFor(() => {
      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });
});
