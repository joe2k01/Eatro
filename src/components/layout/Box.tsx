import { useComposedStyle } from "@hooks/useComposedStyle";
import { forwardRef } from "react";
import { StyleSheet, View, ViewProps, ViewStyle } from "react-native";

export type BoxProps = ViewProps & ViewStyle;

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
    <View {...props} style={composedStyle} ref={ref}>
      {children}
    </View>
  );
});
