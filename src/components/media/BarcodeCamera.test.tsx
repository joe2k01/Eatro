import { render } from "@testing-library/react-native";
import { BarcodeCamera } from "./BarcodeCamera";
import { useCameraPermission } from "react-native-vision-camera";

const mockUseCameraPermission = useCameraPermission as jest.Mock;

describe("BarcodeCamera", () => {
  it("renders camera when active and permission granted", () => {
    const { toJSON } = render(
      <BarcodeCamera isActive onBarcodeScanned={jest.fn()} />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it("returns null without permission", () => {
    mockUseCameraPermission.mockReturnValueOnce({
      hasPermission: false,
      requestPermission: jest.fn(),
    });
    const { toJSON } = render(
      <BarcodeCamera isActive onBarcodeScanned={jest.fn()} />,
    );
    expect(toJSON()).toBeNull();
  });
});
