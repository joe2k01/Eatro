import { renderHook } from "@testing-library/react-native";
import { useDonut, clampNonNegative } from "./useDonut";

describe("clampNonNegative", () => {
  it("returns 0 for negative values", () => {
    expect(clampNonNegative(-5)).toBe(0);
  });

  it("passes through positive values", () => {
    expect(clampNonNegative(10)).toBe(10);
  });

  it("returns 0 for NaN", () => {
    expect(clampNonNegative(NaN)).toBe(0);
  });

  it("returns 0 for Infinity", () => {
    expect(clampNonNegative(Infinity)).toBe(0);
  });

  it("returns 0 for zero", () => {
    expect(clampNonNegative(0)).toBe(0);
  });
});

describe("useDonut", () => {
  it("computes sum from segments", () => {
    const { result } = renderHook(() =>
      useDonut([
        { key: "a", value: 10, color: "red" },
        { key: "b", value: 20, color: "blue" },
      ]),
    );
    expect(result.current.sum).toBe(30);
    expect(result.current.segments).toHaveLength(2);
  });

  it("clamps negative segment values to 0", () => {
    const { result } = renderHook(() =>
      useDonut([{ key: "a", value: -5, color: "red" }]),
    );
    expect(result.current.segments[0].value).toBe(0);
    expect(result.current.sum).toBe(0);
  });

  it("handles empty segments", () => {
    const { result } = renderHook(() => useDonut([]));
    expect(result.current.sum).toBe(0);
    expect(result.current.segments).toHaveLength(0);
  });
});
