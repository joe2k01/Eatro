import { act } from "@testing-library/react-native";
import { renderWithProviders } from "../../../test/helpers/render";
import { Search } from "./Search";

const mockUseManualFoods = jest.fn(
  (_query: string, _opts: unknown): unknown[] => [],
);
const mockUseInfiniteQuery = jest.fn((_opts: unknown) => ({
  data: undefined,
  fetchNextPage: jest.fn(),
  hasNextPage: false,
  isFetching: false,
  isFetchingNextPage: false,
}));
const mockSearchHeader = jest.fn((_props?: unknown) => null);

jest.mock("./components/SearchHeader", () => ({
  SearchHeader: (props: unknown) => mockSearchHeader(props),
}));

jest.mock("@screens/MyFoods/hooks/useManualFoods", () => ({
  useManualFoods: (query: string, opts: unknown) =>
    mockUseManualFoods(query, opts),
}));

jest.mock("@tanstack/react-query", () => ({
  useInfiniteQuery: (opts: unknown) => mockUseInfiniteQuery(opts),
}));

jest.mock("@api/ApiClient", () => ({
  useApiClient: () => ({
    client: {
      searchProducts: jest.fn(),
    },
  }),
}));

describe("Search query debounce", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("applies query after debounce delay", () => {
    renderWithProviders(<Search />);

    expect(mockUseManualFoods).toHaveBeenCalledWith("", expect.anything());

    const firstCallProps = mockSearchHeader.mock.calls[0][0] as {
      onQueryChange: (value: string) => void;
    };

    act(() => {
      firstCallProps.onQueryChange("apple");
    });

    act(() => {
      jest.advanceTimersByTime(450);
    });

    expect(
      mockUseManualFoods.mock.calls.some(([query]) => query === "apple"),
    ).toBe(true);
  });
});
