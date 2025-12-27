import { DonutSegment } from "./types";
import { useMemo } from "react";

export function clampNonNegative(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, n);
}

export type UseDonutInput = {
  /**
   * Segments to display. Values will be clamped to >= 0.
   * Segments with value 0 are filtered out.
   */
  segments: DonutSegment[];
  /**
   * Optional target/total value. If provided, the hook can add a remainder
   * segment so the donut reflects the "target remainder".
   */
  total?: number;
  /** Minimum total to avoid rendering issues when everything is zero. */
  minTotal?: number;
  /**
   * Optional remainder segment. When provided and `total` is provided, the hook
   * adds a remainder segment of `max(0, max(total, sum, minTotal) - sum)`.
   */
  remainder?: {
    key?: string;
    color:
      | string
      | ((ctx: {
          total: number;
          sum: number;
          remainder: number;
          isOverTotal: boolean;
        }) => string);
  };
};

export type UseDonutResult = {
  segments: DonutSegment[];
  sum: number;
};

export function useDonut(segments: DonutSegment[]): UseDonutResult {
  return useMemo(() => {
    const cleanSegments = segments.map((s) => ({
      ...s,
      value: clampNonNegative(s.value),
    }));

    const segmentsTotal = cleanSegments.reduce((acc, s) => acc + s.value, 0);

    return {
      segments: cleanSegments,
      sum: segmentsTotal,
    };
  }, [segments]);
}
