import { screen } from "@testing-library/react-native";
import { renderWithProviders } from "../../../test/helpers/render";
import { HStack } from "./HStack";
import { Text } from "react-native";

describe("HStack", () => {
  it("renders children", () => {
    renderWithProviders(
      <HStack>
        <Text>A</Text>
        <Text>B</Text>
      </HStack>,
    );
    expect(screen.getByText("A")).toBeOnTheScreen();
    expect(screen.getByText("B")).toBeOnTheScreen();
  });

  it("applies horizontal flex direction", () => {
    renderWithProviders(
      <HStack testID="hstack">
        <Text>item</Text>
      </HStack>,
    );
    expect(screen.getByTestId("hstack")).toHaveStyle({ flexDirection: "row" });
  });
});
