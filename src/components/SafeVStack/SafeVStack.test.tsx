import { screen } from "@testing-library/react-native";
import { renderWithProviders } from "../../../test/helpers/render";
import { SafeVStack } from "./SafeVStack";
import { Text } from "react-native";

describe("SafeVStack", () => {
  it("renders children", () => {
    renderWithProviders(
      <SafeVStack>
        <Text>safe content</Text>
      </SafeVStack>,
    );
    expect(screen.getByText("safe content")).toBeOnTheScreen();
  });

  it("accepts guard='top'", () => {
    renderWithProviders(
      <SafeVStack guard="top">
        <Text>top guard</Text>
      </SafeVStack>,
    );
    expect(screen.getByText("top guard")).toBeOnTheScreen();
  });

  it("accepts guard='both'", () => {
    renderWithProviders(
      <SafeVStack guard="both">
        <Text>both guard</Text>
      </SafeVStack>,
    );
    expect(screen.getByText("both guard")).toBeOnTheScreen();
  });
});
