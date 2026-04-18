import { renderWithProviders } from "../../../test/helpers/render";
import { CreateFood } from "./CreateFood";

const mockScreen = jest.fn((_props?: unknown) => null);

jest.mock("@components/layout/Screen", () => ({
  Screen: (props: unknown) => mockScreen(props),
}));

jest.mock("@db/context/DatabaseProvider", () => ({
  useRepositories: () => ({
    food: {
      upsertFood: jest.fn(),
    },
  }),
}));

jest.mock("@components/feedback", () => ({
  SnackbarVariant: {
    Success: "Success",
    Error: "Error",
  },
  useSnackbar: () => jest.fn(),
}));

describe("CreateFood header", () => {
  it("renders screen header with New Food title", () => {
    renderWithProviders(<CreateFood />);
    expect(mockScreen).toHaveBeenCalledWith(
      expect.objectContaining({ title: "New Food" }),
    );
  });
});
