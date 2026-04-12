import { fireEvent, screen } from "@testing-library/react-native";
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

  it("updates button label when a different option is selected", () => {
    const onOptionSelect = jest.fn();
    renderWithProviders(
      <Picker options={options} onOptionSelect={onOptionSelect} />,
    );
    expect(screen.getByText("Select...")).toBeOnTheScreen();

    fireEvent.press(screen.getByTestId("popup-option-lunch"));
    expect(screen.getByText("Lunch")).toBeOnTheScreen();
    expect(screen.queryByText("Select...")).not.toBeOnTheScreen();
    expect(onOptionSelect).toHaveBeenCalledWith(options[1]);

    fireEvent.press(screen.getByTestId("popup-option-breakfast"));
    expect(screen.getByText("Breakfast")).toBeOnTheScreen();
    expect(screen.queryByText("Lunch")).not.toBeOnTheScreen();
    expect(onOptionSelect).toHaveBeenLastCalledWith(options[0]);
  });
});
