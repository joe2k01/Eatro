import { renderWithProviders } from "../../../test/helpers/render";
import { BarcodeProductThumbnail } from "./BarcodeProductThumbnail";

jest.mock("@api/hooks/useOpenFoodFactsFrontImage", () => ({
  useOpenFoodFactsFrontImage: jest.fn(() => ({
    data: { imageUrl: "https://example.com/product.jpg" },
    isError: false,
  })),
}));

describe("BarcodeProductThumbnail", () => {
  it("renders without crashing", () => {
    const { toJSON } = renderWithProviders(
      <BarcodeProductThumbnail
        barcode="123456789"
        style={{ width: 40, height: 40 }}
      />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it("renders with null barcode", () => {
    const { toJSON } = renderWithProviders(
      <BarcodeProductThumbnail
        barcode={null}
        style={{ width: 40, height: 40 }}
      />,
    );
    expect(toJSON()).toBeTruthy();
  });
});
