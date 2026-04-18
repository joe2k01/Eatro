import { renderWithProviders } from "../../../../../test/helpers/render";
import { GoalsConfiguration } from "./GoalsConfiguration";

const mockScreen = jest.fn((_props?: unknown) => null);

jest.mock("@components/layout/Screen", () => ({
  Screen: (props: unknown) => mockScreen(props),
}));

jest.mock("@components/feedback", () => ({
  SnackbarVariant: {
    Success: "Success",
    Error: "Error",
  },
  useSnackbar: () => jest.fn(),
}));

describe("GoalsConfiguration header", () => {
  it("renders screen header with Goals configuration title", () => {
    renderWithProviders(<GoalsConfiguration />);
    expect(mockScreen).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Goals configuration" }),
    );
  });
});
