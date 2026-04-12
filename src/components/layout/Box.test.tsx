import { screen } from "@testing-library/react-native";
import { renderWithProviders } from "../../../test/helpers/render";
import { Box } from "./Box";
import { Text } from "react-native";

describe("Box", () => {
  it("renders children", () => {
    renderWithProviders(
      <Box>
        <Text>child content</Text>
      </Box>,
    );
    expect(screen.getByText("child content")).toBeOnTheScreen();
  });

  it("passes style props through", () => {
    renderWithProviders(
      <Box testID="box" padding={10}>
        <Text>content</Text>
      </Box>,
    );
    expect(screen.getByTestId("box")).toHaveStyle({ padding: 10 });
  });
});
