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
    expect(screen.getByText("content")).toBeTruthy();
  });

  it("renders as ScrollView when scrollable", () => {
    renderWithProviders(
      <ScrollableView scrollable testID="sv-scroll">
        <Text>scroll content</Text>
      </ScrollableView>,
    );
    expect(screen.getByText("scroll content")).toBeTruthy();
  });
});
