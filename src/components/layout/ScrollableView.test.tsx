import { screen } from "@testing-library/react-native";
import { renderWithProviders } from "../../../test/helpers/render";
import { ScrollableView } from "./ScrollableView";
import { Text } from "react-native";

describe("ScrollableView", () => {
  it("renders as View by default", () => {
    renderWithProviders(
      <ScrollableView testID="sv">
        <Text>content</Text>
      </ScrollableView>,
    );
    const root = screen.getByTestId("sv");
    expect(root.type).toBe("View");
    expect(screen.getByText("content")).toBeOnTheScreen();
  });

  it("renders as ScrollView when scrollable", () => {
    renderWithProviders(
      <ScrollableView scrollable testID="sv-scroll">
        <Text>scroll content</Text>
      </ScrollableView>,
    );
    const root = screen.getByTestId("sv-scroll");
    expect(root.type).toContain("ScrollView");
    expect(screen.getByText("scroll content")).toBeOnTheScreen();
  });
});
