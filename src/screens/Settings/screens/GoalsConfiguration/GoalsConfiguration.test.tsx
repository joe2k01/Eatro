import { renderWithProviders } from "../../../../../test/helpers/render";
import { GoalsConfiguration } from "./GoalsConfiguration";

const mockScreenHeader = jest.fn((_props?: unknown) => null);

jest.mock("@components/navigation/ScreenHeader", () => ({
  ScreenHeader: (props: unknown) => mockScreenHeader(props),
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
    expect(mockScreenHeader).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Goals configuration" }),
    );
  });
});
