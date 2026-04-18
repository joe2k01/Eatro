import { renderWithProviders } from "../../../../../test/helpers/render";
import { SettingsHome } from "./SettingsHome";

const mockScreen = jest.fn((_props?: unknown) => null);

jest.mock("@components/layout/Screen", () => ({
  Screen: (props: unknown) => mockScreen(props),
}));

jest.mock("@contexts/UserContextProvider", () => ({
  useUser: () => ({ name: "Joe" }),
}));

describe("SettingsHome header", () => {
  it("renders screen header with User configuration title", () => {
    renderWithProviders(<SettingsHome />);
    expect(mockScreen).toHaveBeenCalledWith(
      expect.objectContaining({ title: "User configuration" }),
    );
  });
});
