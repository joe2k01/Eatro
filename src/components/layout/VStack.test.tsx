import { screen } from "@testing-library/react-native";
import { renderWithProviders } from "../../../test/helpers/render";
import { VStack } from "./VStack";
import { Text } from "react-native";

describe("VStack", () => {
  it("renders children", () => {
    renderWithProviders(
      <VStack>
        <Text>A</Text>
        <Text>B</Text>
      </VStack>,
    );
    expect(screen.getByText("A")).toBeOnTheScreen();
    expect(screen.getByText("B")).toBeOnTheScreen();
  });

  it("applies vertical flex direction", () => {
    renderWithProviders(
      <VStack testID="vstack">
        <Text>item</Text>
      </VStack>,
    );
    expect(screen.getByTestId("vstack")).toHaveStyle({
      flexDirection: "column",
    });
  });
});
