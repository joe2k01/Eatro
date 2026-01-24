import { forwardRef } from "react";
import { View, ViewProps, ViewStyle, StyleProp } from "react-native";
import { ScrollableView } from "./ScrollableView";

export type BoxProps = ViewProps & {
  style?: StyleProp<ViewStyle>;
};

export const Box = forwardRef<View, BoxProps>(function Box(
  { children, ...props }: BoxProps,
  ref,
) {
  return (
    <ScrollableView {...props} ref={ref}>
      {children}
    </ScrollableView>
  );
});
