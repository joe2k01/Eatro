import { renderWithProviders } from "../../../test/helpers/render";
import { MyFoods } from "./MyFoods";

const mockScreenHeader = jest.fn((_props?: unknown) => null);

jest.mock("@components/navigation/ScreenHeader", () => ({
  ScreenHeader: (props: unknown) => mockScreenHeader(props),
}));

jest.mock("react-native-tab-view", () => ({
  TabView: () => null,
  TabBar: () => null,
}));

jest.mock("./hooks/useMyFoodsTabBarTheme", () => ({
  useMyFoodsTabBarTheme: () => ({
    styles: { bar: {}, indicator: {} },
    activeColor: "#fff",
    inactiveColor: "#aaa",
    pressColor: "#ccc",
    androidRipple: {},
  }),
}));

jest.mock("./scenes/FoodsScene", () => ({
  FoodsScene: () => null,
}));

jest.mock("./scenes/MealsScene", () => ({
  MealsScene: () => null,
}));

describe("MyFoods header", () => {
  it("renders screen header with custom center and right content", () => {
    renderWithProviders(<MyFoods />);
    expect(mockScreenHeader).toHaveBeenCalledWith(
      expect.objectContaining({
        center: expect.anything(),
        right: expect.anything(),
      }),
    );
  });
});
