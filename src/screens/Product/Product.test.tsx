import { renderWithProviders } from "../../../test/helpers/render";
import { Product } from "./Product";

const mockScreenHeader = jest.fn((_props?: unknown) => null);

jest.mock("@components/navigation/ScreenHeader", () => ({
  ScreenHeader: (props: unknown) => mockScreenHeader(props),
}));

jest.mock("@hooks/useParams", () => ({
  useParams: () => ({}),
}));

jest.mock("./ApiProductLoader", () => ({
  ApiProductLoader: () => null,
}));

jest.mock("./DbProductLoader", () => ({
  DbProductLoader: () => null,
}));

jest.mock("./ProductLoader", () => ({
  ProductLoader: () => null,
}));

jest.mock("./ProductError", () => ({
  ProductError: () => null,
}));

describe("Product header", () => {
  it("renders screen header with Product title", () => {
    renderWithProviders(<Product />);
    expect(mockScreenHeader).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Product" }),
    );
  });
});
