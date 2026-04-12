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

function countCircleNodes(node: unknown): number {
  if (!node || typeof node !== "object") return 0;
  if (Array.isArray(node)) {
    return node.reduce((sum, child) => sum + countCircleNodes(child), 0);
  }

  const jsonNode = node as {
    type?: string;
    children?: unknown[];
  };
  const ownCount =
    typeof jsonNode.type === "string" &&
    jsonNode.type.toLowerCase().includes("circle")
      ? 1
      : 0;

  return ownCount + countCircleNodes(jsonNode.children ?? []);
}

describe("DonutChart", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders one circle per segment plus track", () => {
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
    expect(countCircleNodes(toJSON())).toBe(4);
    flushDonutTimers();
  });

  it("renders with empty data (track only)", () => {
    const { result } = renderHook(() => useDonut([]));

    const { toJSON } = renderWithProviders(
      <DonutChart donutData={result.current} width={100} />,
    );
    expect(countCircleNodes(toJSON())).toBe(1);
    flushDonutTimers();
  });

  it("renders single segment plus track", () => {
    const { result } = renderHook(() =>
      useDonut([{ key: "protein", value: 100, color: "#4CAF50" }]),
    );

    const { toJSON } = renderWithProviders(
      <DonutChart donutData={result.current} width={100} />,
    );
    expect(countCircleNodes(toJSON())).toBe(2);
    flushDonutTimers();
  });
});
