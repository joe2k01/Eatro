import { screen } from "@testing-library/react-native";
import { Text } from "react-native";
import { renderWithProviders } from "../../../test/helpers/render";
import { Screen } from "./Screen";

const mockSafeVStack = jest.fn(
  ({ children }: { children?: React.ReactNode }) => <>{children}</>,
);

jest.mock("@components/SafeVStack", () => ({
  SafeVStack: (props: Record<string, unknown>) => mockSafeVStack(props),
}));

const mockScreenHeader = jest.fn((_props?: Record<string, unknown>) => null);

jest.mock("@components/navigation/ScreenHeader", () => ({
  ScreenHeader: (props: Record<string, unknown>) => mockScreenHeader(props),
}));

describe("Screen", () => {
  beforeEach(() => {
    mockSafeVStack.mockClear();
    mockScreenHeader.mockClear();
  });

  it("renders children", () => {
    renderWithProviders(
      <Screen title="T">
        <Text>child</Text>
      </Screen>,
    );
    expect(screen.getByText("child")).toBeOnTheScreen();
  });

  it("forwards title to ScreenHeader", () => {
    renderWithProviders(<Screen title="Goals" />);
    expect(mockScreenHeader).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Goals" }),
    );
  });

  it("defaults paddingHorizontal on SafeVStack to 2", () => {
    renderWithProviders(<Screen title="X" />);
    expect(mockSafeVStack).toHaveBeenCalledWith(
      expect.objectContaining({ paddingHorizontal: 2 }),
    );
  });

  it("allows overriding paddingHorizontal on SafeVStack", () => {
    renderWithProviders(<Screen title="X" paddingHorizontal={0} />);
    expect(mockSafeVStack).toHaveBeenCalledWith(
      expect.objectContaining({ paddingHorizontal: 0 }),
    );
  });

  it("forwards guard and scrollable to SafeVStack", () => {
    renderWithProviders(
      <Screen title="X" guard="top" scrollable>
        <Text>a</Text>
      </Screen>,
    );
    expect(mockSafeVStack).toHaveBeenCalledWith(
      expect.objectContaining({ guard: "top", scrollable: true }),
    );
  });

  it("respects headerStyle on ScreenHeader", () => {
    const headerStyle = { opacity: 0.5 };
    renderWithProviders(<Screen title="X" headerStyle={headerStyle} />);
    expect(mockScreenHeader).toHaveBeenCalledWith(
      expect.objectContaining({ style: headerStyle }),
    );
  });
});
