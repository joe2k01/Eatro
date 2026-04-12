import { renderWithProviders } from "../../../test/helpers/render";
import { Home } from "./Home";

const mockScreenHeader = jest.fn((_props?: unknown) => null);

jest.mock("@components/navigation/ScreenHeader", () => ({
  ScreenHeader: (props: unknown) => mockScreenHeader(props),
}));

jest.mock("@db/context/DatabaseProvider", () => ({
  useRepositories: () => ({
    meal: {
      deleteMealFoodTx: jest.fn(),
      updateMealFoodTx: jest.fn(),
    },
    mealFood: {},
  }),
}));

jest.mock("@db/hooks/useGetDay", () => ({
  useGetDay: () => ({
    macros: null,
    meals: [],
    reload: jest.fn(),
  }),
}));

jest.mock("@components/feedback", () => ({
  SnackbarVariant: {
    Success: "Success",
    Error: "Error",
  },
  useSnackbar: () => jest.fn(),
  ConfirmDeleteTray: () => null,
}));

jest.mock("./components/MealItem", () => ({
  MealItem: () => null,
}));

jest.mock("./components/LogFoodFAB", () => ({
  LogFoodFAB: () => null,
}));

jest.mock("@screens/Product/ProductTray", () => ({
  ProductTray: () => null,
}));

describe("Home header", () => {
  it("renders screen header with custom left and center content", () => {
    renderWithProviders(<Home />);
    expect(mockScreenHeader).toHaveBeenCalledWith(
      expect.objectContaining({
        left: expect.anything(),
        center: expect.anything(),
      }),
    );
  });
});
