import { forwardRef } from "react";
import { View, ViewProps, ViewStyle } from "react-native";
import { ScrollableView } from "./ScrollableView";
import { StyledViewProps } from "@constants/theme";

export type BoxProps = StyledViewProps<ViewProps & ViewStyle>;

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
