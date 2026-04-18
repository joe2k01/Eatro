import { fireEvent, screen } from "@testing-library/react-native";
import { renderWithProviders } from "../../../../test/helpers/render";
import { SearchHeader } from "./SearchHeader";

const mockNavigate = jest.fn();

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    canGoBack: () => true,
    goBack: jest.fn(),
  }),
}));

describe("SearchHeader", () => {
  it("calls onQueryChange when input changes", () => {
    const onQueryChange = jest.fn();

    renderWithProviders(
      <SearchHeader query="" onQueryChange={onQueryChange} />,
    );

    fireEvent.changeText(screen.getByPlaceholderText("Search food..."), "milk");
    expect(onQueryChange).toHaveBeenCalledWith("milk");
  });

  it("clears query when close icon is pressed", () => {
    const onQueryChange = jest.fn();

    renderWithProviders(
      <SearchHeader query="milk" onQueryChange={onQueryChange} />,
    );

    fireEvent.press(screen.getByText("close"));
    expect(onQueryChange).toHaveBeenCalledWith("");
  });
});
