import { screen } from "@testing-library/react-native";
import { renderWithProviders } from "../../../test/helpers/render";
import { Header, type HeaderProps } from "./Header";

const baseProps = {
  route: { key: "test-1", name: "TestScreen" },
  options: {},
  navigation: {} as HeaderProps["navigation"],
  layout: { width: 400, height: 60 },
} as HeaderProps;

describe("Header", () => {
  it("renders with route name as title", () => {
    renderWithProviders(<Header {...baseProps} />);
    expect(screen.getByText("TestScreen")).toBeOnTheScreen();
  });

  it("renders with options.title", () => {
    renderWithProviders(
      <Header {...baseProps} options={{ title: "Custom Title" }} />,
    );
    expect(screen.getByText("Custom Title")).toBeOnTheScreen();
  });

  it("renders with headerTitle string", () => {
    renderWithProviders(
      <Header {...baseProps} options={{ headerTitle: "Header Title" }} />,
    );
    expect(screen.getByText("Header Title")).toBeOnTheScreen();
  });
});
