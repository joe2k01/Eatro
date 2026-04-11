import { screen, fireEvent } from "@testing-library/react-native";
import { renderWithProviders } from "../../../test/helpers/render";
import { PillButton } from "./PillButton";

const options = [
  { label: "Per 100g", value: "100g" },
  { label: "Per serving", value: "serving" },
];

describe("PillButton", () => {
  it("renders all option labels", () => {
    renderWithProviders(
      <PillButton
        options={options}
        selected="100g"
        onSelect={jest.fn()}
      />,
    );
    expect(screen.getByText("Per 100g")).toBeTruthy();
    expect(screen.getByText("Per serving")).toBeTruthy();
  });

  it("fires onSelect with correct value on press", () => {
    const onSelect = jest.fn();
    renderWithProviders(
      <PillButton
        options={options}
        selected="100g"
        onSelect={onSelect}
      />,
    );
    fireEvent.press(screen.getByText("Per serving"));
    expect(onSelect).toHaveBeenCalledWith("serving");
  });
});
