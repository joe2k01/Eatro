import { waitFor } from "@testing-library/react-native";
import { renderWithProviders } from "../../../test/helpers/render";
import { CustomMealDetail } from "./CustomMealDetail";

const mockScreen = jest.fn((_props?: unknown) => null);

jest.mock("@components/layout/Screen", () => ({
  Screen: (props: unknown) => mockScreen(props),
}));

jest.mock("@hooks/useParams", () => ({
  useParams: () => ({ customMealId: 1 }),
}));

jest.mock("@db/context/DatabaseProvider", () => ({
  useRepositories: () => ({
    customMeal: {
      getCustomMealById: jest.fn(async () => ({
        id: 1,
        name: "Meal",
        energy: 200,
        proteins: 20,
        carbohydrates: 20,
        fat: 10,
      })),
    },
    customMealFood: {
      getFoodsByCustomMealId: jest.fn(async () => []),
    },
    meal: {
      logCustomMealTx: jest.fn(),
    },
    mealFood: {},
  }),
}));

jest.mock("@components/feedback", () => ({
  SnackbarVariant: {
    Success: "Success",
    Error: "Error",
  },
  useSnackbar: () => jest.fn(),
}));

describe("CustomMealDetail header", () => {
  it("renders screen header with Meal Detail title", async () => {
    renderWithProviders(<CustomMealDetail />);

    await waitFor(() =>
      expect(mockScreen).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Meal Detail" }),
      ),
    );
  });
});
