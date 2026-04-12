import { screen } from "@testing-library/react-native";
import { renderWithProviders } from "../../../test/helpers/render";
import { Text, Display, Heading, Title, Body, Caption, Label } from "./Text";

describe("Text", () => {
  it("renders children text", () => {
    renderWithProviders(<Text>hello world</Text>);
    expect(screen.getByText("hello world")).toBeOnTheScreen();
  });

  it("applies inline style props", () => {
    renderWithProviders(<Text color="red">styled</Text>);
    expect(screen.getByText("styled")).toHaveStyle({ color: "red" });
  });
});

describe("Typography variants", () => {
  it.each([
    ["Display", Display],
    ["Heading", Heading],
    ["Title", Title],
    ["Body", Body],
    ["Caption", Caption],
    ["Label", Label],
  ] as const)("%s renders text", (name, Component) => {
    renderWithProviders(<Component>{name} text</Component>);
    expect(screen.getByText(`${name} text`)).toBeOnTheScreen();
  });

  it("passes style overrides through", () => {
    renderWithProviders(<Body style={{ fontSize: 99 }}>big body</Body>);
    expect(screen.getByText("big body")).toHaveStyle({ fontSize: 99 });
  });
});
