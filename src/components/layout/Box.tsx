import { useComposedStyle } from "@hooks/useComposedStyle";
import { forwardRef } from "react";
import { StyleSheet, View, ViewProps, ViewStyle } from "react-native";
import { ScrollableView } from "./ScrollableView";
import { StyledViewProps } from "@constants/theme";

export type BoxProps = StyledViewProps<ViewProps & ViewStyle>;

const style = StyleSheet.create({
  box: {
    display: "flex",
  },
});

export const Box = forwardRef<View, BoxProps>(function Box(
  { children, ...props }: BoxProps,
  ref,
) {
  const composedStyle = useComposedStyle<ViewStyle>({
    base: style.box,
    props,
  });

  return (
    <ScrollableView {...props} style={composedStyle} ref={ref}>
      {children}
    </ScrollableView>
  );
});
