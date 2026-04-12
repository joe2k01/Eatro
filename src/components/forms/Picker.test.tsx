import { screen } from "@testing-library/react-native";
import { renderWithProviders } from "../../../test/helpers/render";
import { Picker } from "./Picker";

const options = [
  { label: "Breakfast", value: "breakfast" },
  { label: "Lunch", value: "lunch" },
];

describe("Picker", () => {
  it("renders placeholder when nothing selected", () => {
    renderWithProviders(
      <Picker
        options={options}
        onOptionSelect={jest.fn()}
        placeholder="Choose meal"
      />,
    );
    expect(screen.getByText("Choose meal")).toBeOnTheScreen();
  });

  it("renders default placeholder", () => {
    renderWithProviders(
      <Picker options={options} onOptionSelect={jest.fn()} />,
    );
    expect(screen.getByText("Select...")).toBeOnTheScreen();
  });

  it("renders inside popup-button mock", () => {
    renderWithProviders(
      <Picker options={options} onOptionSelect={jest.fn()} />,
    );
    expect(screen.getByTestId("popup-button")).toBeOnTheScreen();
  });
});
