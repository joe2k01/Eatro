import { screen } from "@testing-library/react-native";
import { renderWithProviders } from "../../../test/helpers/render";
import { KeyboardView } from "./KeyboardView";
import { Text } from "react-native";

describe("KeyboardView", () => {
  it("renders children", () => {
    renderWithProviders(
      <KeyboardView>
        <Text>keyboard content</Text>
      </KeyboardView>,
    );
    expect(screen.getByText("keyboard content")).toBeTruthy();
  });
});
