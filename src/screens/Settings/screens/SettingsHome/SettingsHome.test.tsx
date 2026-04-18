import { renderWithProviders } from "../../../../../test/helpers/render";
import { SettingsHome } from "./SettingsHome";

const mockScreenHeader = jest.fn((_props?: unknown) => null);

jest.mock("@components/navigation/ScreenHeader", () => ({
  ScreenHeader: (props: unknown) => mockScreenHeader(props),
}));

jest.mock("@contexts/UserContextProvider", () => ({
  useUser: () => ({ name: "Joe" }),
}));

describe("SettingsHome header", () => {
  it("renders screen header with User configuration title", () => {
    renderWithProviders(<SettingsHome />);
    expect(mockScreenHeader).toHaveBeenCalledWith(
      expect.objectContaining({ title: "User configuration" }),
    );
  });
});
