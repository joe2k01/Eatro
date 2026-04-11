import { screen } from "@testing-library/react-native";
import { renderWithProviders } from "../../../test/helpers/render";
import { TextInput } from "./TextInput";

describe("TextInput", () => {
  it("renders label when provided as string", () => {
    renderWithProviders(<TextInput label="Name" />);
    expect(screen.getByText("Name")).toBeTruthy();
  });

  it("renders unit suffix", () => {
    renderWithProviders(<TextInput unit="kcal" />);
    expect(screen.getByText("kcal")).toBeTruthy();
  });

  it("shows error message when error is set", () => {
    renderWithProviders(<TextInput error="Required field" />);
    expect(screen.getByText("Required field")).toBeTruthy();
  });

  it("renders without label or unit", () => {
    const { toJSON } = renderWithProviders(
      <TextInput placeholder="type..." />,
    );
    expect(toJSON()).toBeTruthy();
  });
});
