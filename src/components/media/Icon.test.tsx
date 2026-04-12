import { screen } from "@testing-library/react-native";
import { renderWithProviders } from "../../../test/helpers/render";
import { Icon } from "./Icon";

describe("Icon", () => {
  it("renders MaterialIcons by default", () => {
    renderWithProviders(<Icon name="add" />);
    expect(screen.getByText("add")).toBeOnTheScreen();
  });

  it("renders MaterialCommunityIcons when community", () => {
    renderWithProviders(<Icon community name="chevron-down" />);
    expect(screen.getByText("chevron-down")).toBeOnTheScreen();
  });
});
