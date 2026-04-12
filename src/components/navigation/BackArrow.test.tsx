import { screen, fireEvent } from "@testing-library/react-native";
import { renderWithProviders } from "../../../test/helpers/render";
import { BackArrow } from "./BackArrow";
import { useNavigation } from "@react-navigation/native";

const mockUseNavigation = useNavigation as jest.Mock;

describe("BackArrow", () => {
  beforeEach(() => {
    mockUseNavigation.mockReturnValue({
      goBack: jest.fn(),
      navigate: jest.fn(),
      canGoBack: jest.fn(() => true),
    });
  });

  it("renders back chevron icon", () => {
    renderWithProviders(<BackArrow canGoBack />);
    expect(screen.getByText("chevron-left")).toBeOnTheScreen();
  });

  it("calls navigation.goBack on press", () => {
    const goBack = jest.fn();
    mockUseNavigation.mockReturnValue({
      goBack,
      navigate: jest.fn(),
      canGoBack: jest.fn(() => true),
    });

    renderWithProviders(<BackArrow canGoBack />);
    fireEvent.press(screen.getByText("chevron-left"));
    expect(goBack).toHaveBeenCalled();
  });

  it("is disabled when canGoBack is false", () => {
    const goBack = jest.fn();
    mockUseNavigation.mockReturnValue({
      goBack,
      navigate: jest.fn(),
      canGoBack: jest.fn(() => false),
    });

    renderWithProviders(<BackArrow canGoBack={false} />);
    fireEvent.press(screen.getByText("chevron-left"));
    expect(goBack).not.toHaveBeenCalled();
  });
});
