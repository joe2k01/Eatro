import { screen, fireEvent } from "@testing-library/react-native";
import { renderWithProviders } from "../../../test/helpers/render";
import { IconButton } from "./IconButton";

describe("IconButton", () => {
  it("renders icon", () => {
    renderWithProviders(<IconButton name="close" onPress={jest.fn()} />);
    expect(screen.getByText("close")).toBeTruthy();
  });

  it("fires onPress on press", () => {
    const onPress = jest.fn();
    renderWithProviders(<IconButton name="add" onPress={onPress} />);
    fireEvent.press(screen.getByText("add"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("disabled blocks press", () => {
    const onPress = jest.fn();
    renderWithProviders(
      <IconButton name="delete" onPress={onPress} disabled />,
    );
    fireEvent.press(screen.getByText("delete"));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("renders with ghost variant", () => {
    renderWithProviders(
      <IconButton name="menu" variant="ghost" onPress={jest.fn()} />,
    );
    expect(screen.getByText("menu")).toBeTruthy();
  });
});
