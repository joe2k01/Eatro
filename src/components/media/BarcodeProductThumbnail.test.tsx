import { renderWithProviders } from "../../../test/helpers/render";
import { BarcodeProductThumbnail } from "./BarcodeProductThumbnail";
import { useOpenFoodFactsFrontImage } from "@api/hooks/useOpenFoodFactsFrontImage";

const mockRemoteImage = jest.fn((_props: unknown) => null);

jest.mock("@components/media/RemoteImage", () => ({
  RemoteImage: (props: unknown) => mockRemoteImage(props),
}));

jest.mock("@api/hooks/useOpenFoodFactsFrontImage");

const mockUseOpenFoodFactsFrontImage =
  useOpenFoodFactsFrontImage as jest.MockedFunction<
    typeof useOpenFoodFactsFrontImage
  >;

describe("BarcodeProductThumbnail", () => {
  beforeEach(() => {
    mockRemoteImage.mockClear();
  });

  it("passes image source to RemoteImage when hook succeeds", () => {
    mockUseOpenFoodFactsFrontImage.mockReturnValue({
      data: { imageUrl: "https://example.com/product.jpg" },
      isError: false,
    } as ReturnType<typeof useOpenFoodFactsFrontImage>);

    renderWithProviders(
      <BarcodeProductThumbnail
        barcode="123456789"
        style={{ width: 40, height: 40 }}
      />,
    );
    expect(mockRemoteImage).toHaveBeenCalledWith(
      expect.objectContaining({
        source: { uri: "https://example.com/product.jpg" },
        shape: "squircle",
      }),
    );
  });

  it("passes undefined source to RemoteImage when hook errors", () => {
    mockUseOpenFoodFactsFrontImage.mockReturnValue({
      data: undefined,
      isError: true,
    } as ReturnType<typeof useOpenFoodFactsFrontImage>);

    renderWithProviders(
      <BarcodeProductThumbnail
        barcode="123456789"
        style={{ width: 40, height: 40 }}
      />,
    );
    expect(mockRemoteImage).toHaveBeenCalledWith(
      expect.objectContaining({
        source: undefined,
      }),
    );
  });

  it("passes null barcode to image hook and renders fallback source", () => {
    mockUseOpenFoodFactsFrontImage.mockReturnValue({
      data: undefined,
      isError: false,
    } as ReturnType<typeof useOpenFoodFactsFrontImage>);

    renderWithProviders(
      <BarcodeProductThumbnail
        barcode={null}
        style={{ width: 40, height: 40 }}
      />,
    );

    expect(mockUseOpenFoodFactsFrontImage).toHaveBeenCalledWith(null);
    expect(mockRemoteImage).toHaveBeenCalledWith(
      expect.objectContaining({
        source: undefined,
      }),
    );
  });
});
