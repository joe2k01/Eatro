import { EatroTheme } from "@constants/theme";
import { screen } from "@testing-library/react-native";
import { renderWithProviders } from "../../../test/helpers/render";
import { TextInput } from "./TextInput";

describe("TextInput", () => {
  it("renders label when provided as string", () => {
    renderWithProviders(<TextInput label="Name" />);
    expect(screen.getByText("Name")).toBeOnTheScreen();
  });

  it("renders unit suffix", () => {
    renderWithProviders(<TextInput unit="kcal" />);
    expect(screen.getByText("kcal")).toBeOnTheScreen();
  });

  it("shows error message when error is set", () => {
    renderWithProviders(<TextInput error="Required field" />);
    expect(screen.getByText("Required field")).toBeOnTheScreen();
    expect(screen.getByText("Required field")).toHaveStyle({
      color: EatroTheme.dark.semantic.destructive,
    });
  });

  it("renders without label or unit", () => {
    renderWithProviders(<TextInput placeholder="type..." />);
    expect(screen.getByPlaceholderText("type...")).toBeOnTheScreen();
  });
});
