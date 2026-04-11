import { createRef } from "react";
import { screen } from "@testing-library/react-native";
import type { TrayApi } from "@components/layout/Tray";
import { renderWithProviders } from "../../../test/helpers/render";
import { ConfirmDeleteTray } from "./ConfirmDeleteTray";

describe("ConfirmDeleteTray", () => {
  it("renders food name in confirmation message", () => {
    const trayRef = createRef<TrayApi>();
    renderWithProviders(
      <ConfirmDeleteTray
        trayRef={trayRef}
        foodName="Banana"
        onConfirm={jest.fn(async () => {})}
        onCancel={jest.fn()}
      />,
    );
    expect(screen.getByText(/Banana/)).toBeTruthy();
  });

  it("renders confirm and cancel buttons", () => {
    const trayRef = createRef<TrayApi>();
    renderWithProviders(
      <ConfirmDeleteTray
        trayRef={trayRef}
        foodName="Apple"
        onConfirm={jest.fn(async () => {})}
        onCancel={jest.fn()}
      />,
    );
    expect(screen.getByText("Yes, remove")).toBeTruthy();
    expect(screen.getByText("Cancel")).toBeTruthy();
  });
});
