import { Dimension, DimensionSize } from "@constants/theme";
import { useMemo } from "react";

export function intoThemeDimension(input: Dimension) {
  return input * DimensionSize;
}

export function useThemeDimension(input: Dimension) {
  return useMemo(() => input * DimensionSize, [input]);
}
