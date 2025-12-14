import { useLayoutEffect, useRef } from "react";
import { View } from "react-native";

export function useCenteredHeader() {
  const leftRef = useRef<View>(null);
  const rightRef = useRef<View>(null);

  useLayoutEffect(() => {
    const left = leftRef.current;

    if (left) {
      left.measure((_x, _y, width) => {
        // This is ughly but it seems to be the only reliable way to center the date text
        // The usual flexbox solution with grow doesn't seem to work
        rightRef.current?.setNativeProps({ width });
      });
    }
  }, []);

  return { leftRef, rightRef };
}
