import { screen, fireEvent } from "@testing-library/react-native";
import { renderWithProviders } from "../../../test/helpers/render";
import { Button } from "./Button";
import { Icon } from "@components/media/Icon";

describe("Button", () => {
  it("renders label text", () => {
    renderWithProviders(<Button onPress={jest.fn()}>Save</Button>);
    expect(screen.getByText("Save")).toBeTruthy();
  });

  it("fires onPress callback on press", () => {
    const onPress = jest.fn();
    renderWithProviders(<Button onPress={onPress}>Tap</Button>);
    fireEvent.press(screen.getByText("Tap"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("disabled prop blocks onPress", () => {
    const onPress = jest.fn();
    renderWithProviders(
      <Button onPress={onPress} disabled>
        Disabled
      </Button>,
    );
    fireEvent.press(screen.getByText("Disabled"));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("renders secondary text", () => {
    renderWithProviders(
      <Button onPress={jest.fn()} secondaryText="sub text">
        Main
      </Button>,
    );
    expect(screen.getByText("sub text")).toBeTruthy();
  });

  it("renders left icon", () => {
    renderWithProviders(
      <Button onPress={jest.fn()} leftIcon={<Icon name="add" />}>
        With Icon
      </Button>,
    );
    expect(screen.getByText("add")).toBeTruthy();
  });

  it("renders right icon", () => {
    renderWithProviders(
      <Button onPress={jest.fn()} rightIcon={<Icon name="close" />}>
        With Right
      </Button>,
    );
    expect(screen.getByText("close")).toBeTruthy();
  });

  it("renders with ghost variant", () => {
    renderWithProviders(
      <Button variant="ghost" onPress={jest.fn()}>
        Ghost
      </Button>,
    );
    expect(screen.getByText("Ghost")).toBeTruthy();
  });
});
