import { renderWithProviders } from "../../../test/helpers/render";
import { Scanner } from "./Scanner";

const mockScreenHeader = jest.fn((_props?: unknown) => null);

jest.mock("@components/navigation/ScreenHeader", () => ({
  ScreenHeader: (props: unknown) => mockScreenHeader(props),
}));

jest.mock("@components/media/BarcodeCamera", () => ({
  BarcodeCamera: () => null,
}));

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    canGoBack: () => true,
    addListener: jest.fn(),
    removeListener: jest.fn(),
  }),
}));

describe("Scanner header", () => {
  it("renders screen header with transparent style", () => {
    renderWithProviders(<Scanner />);
    expect(mockScreenHeader).toHaveBeenCalledWith(
      expect.objectContaining({
        style: expect.objectContaining({ backgroundColor: "transparent" }),
      }),
    );
  });
});
