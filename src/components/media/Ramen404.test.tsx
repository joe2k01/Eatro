jest.mock("react-native-reanimated", () =>
  require("react-native-reanimated/mock"),
);

import { renderWithProviders } from "../../../test/helpers/render";
import { Ramen404 } from "./Ramen404";

describe("Ramen404", () => {
  it("renders without crashing", () => {
    const { toJSON } = renderWithProviders(<Ramen404 />);
    expect(toJSON()).toBeTruthy();
  });
});
