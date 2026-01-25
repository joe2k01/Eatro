import { forwardRef } from "react";
import { View } from "react-native";
import { ScrollableView, ScrollableViewProps } from "./ScrollableView";

export type BoxProps = ScrollableViewProps;

export const Box = forwardRef<View, BoxProps>(function Box(
  { children, ...props },
  ref,
) {
  return (
    <ScrollableView {...props} ref={ref}>
      {children}
    </ScrollableView>
  );
});
