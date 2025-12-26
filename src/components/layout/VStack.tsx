import { useComposedStyle } from "@hooks/useComposedStyle";
import { StyleSheet, ViewStyle } from "react-native";
import { ScrollableView, ScrollableViewProps } from "./ScrollableView";

export type VStackProps = ScrollableViewProps;

const style = StyleSheet.create({
  vStack: {
    display: "flex",
    flexDirection: "column",
  },
});

export function VStack({ children, ...props }: ScrollableViewProps) {
  const composedStyle = useComposedStyle<ViewStyle>({
    base: style.vStack,
    props,
  });

  return (
    <ScrollableView {...props} style={composedStyle}>
      {children}
    </ScrollableView>
  );
}
