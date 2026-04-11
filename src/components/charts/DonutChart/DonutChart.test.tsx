import { act, renderHook } from "@testing-library/react-native";
import { renderWithProviders } from "../../../../test/helpers/render";
import { DonutChart } from "./DonutChart";
import { useDonut } from "./useDonut";

/** DonutChart debounces updates and runs Reanimated timing; flush before unmount. */
function flushDonutTimers() {
  act(() => {
    jest.advanceTimersByTime(15_000);
  });
}

describe("DonutChart", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders with multiple segments", () => {
    const { result } = renderHook(() =>
      useDonut([
        { key: "protein", value: 30, color: "#4CAF50" },
        { key: "carbs", value: 50, color: "#2196F3" },
        { key: "fat", value: 20, color: "#FF9800" },
      ]),
    );

    const { toJSON } = renderWithProviders(
      <DonutChart donutData={result.current} width={100} />,
    );
    expect(toJSON()).toBeTruthy();
    flushDonutTimers();
  });

  it("renders with empty data (track only)", () => {
    const { result } = renderHook(() => useDonut([]));

    const { toJSON } = renderWithProviders(
      <DonutChart donutData={result.current} width={100} />,
    );
    expect(toJSON()).toBeTruthy();
    flushDonutTimers();
  });

  it("renders with single segment", () => {
    const { result } = renderHook(() =>
      useDonut([{ key: "protein", value: 100, color: "#4CAF50" }]),
    );

    const { toJSON } = renderWithProviders(
      <DonutChart donutData={result.current} width={100} />,
    );
    expect(toJSON()).toBeTruthy();
    flushDonutTimers();
  });

  it("renders with total prop", () => {
    const { result } = renderHook(() =>
      useDonut([{ key: "protein", value: 30, color: "#4CAF50" }]),
    );

    const { toJSON } = renderWithProviders(
      <DonutChart donutData={result.current} total={100} width={100} />,
    );
    expect(toJSON()).toBeTruthy();
    flushDonutTimers();
  });

  it("renders with custom strokeWidth", () => {
    const { result } = renderHook(() =>
      useDonut([{ key: "a", value: 50, color: "red" }]),
    );

    const { toJSON } = renderWithProviders(
      <DonutChart donutData={result.current} strokeWidth={10} width={100} />,
    );
    expect(toJSON()).toBeTruthy();
    flushDonutTimers();
  });
});
