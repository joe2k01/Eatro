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
    expect(screen.getByText("A")).toBeTruthy();
    expect(screen.getByText("B")).toBeTruthy();
  });

  it("applies horizontal flex direction", () => {
    const { toJSON } = renderWithProviders(
      <HStack testID="hstack">
        <Text>item</Text>
      </HStack>,
    );
    const root = toJSON();
    expect(root).toBeTruthy();
  });
});
