import { screen } from "@testing-library/react-native";
import { renderWithProviders } from "../../../test/helpers/render";
import { Tray } from "./Tray";
import { Text } from "react-native";

describe("Tray", () => {
  it("renders children", () => {
    renderWithProviders(
      <Tray>
        <Text>tray content</Text>
      </Tray>,
    );
    expect(screen.getByText("tray content")).toBeOnTheScreen();
  });
});
