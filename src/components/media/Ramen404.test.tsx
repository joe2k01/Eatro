import { renderWithProviders } from "../../../test/helpers/render";
import { Ramen404 } from "./Ramen404";

jest.mock("react-native-reanimated", () =>
  require("react-native-reanimated/mock"),
);

describe("Ramen404", () => {
  it("renders without crashing", () => {
    const { toJSON } = renderWithProviders(<Ramen404 />);
    expect(toJSON()).toBeTruthy();
  });
});
