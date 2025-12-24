import { useComposedStyle } from "@hooks/useComposedStyle";
import { StyleSheet, ViewStyle } from "react-native";
import { ScrollableView, ScrollableViewProps } from "./ScrollableView";

export type HStackProps = ScrollableViewProps;

const style = StyleSheet.create({
  hStack: {
    display: "flex",
    flexDirection: "row",
  },
});

export function HStack({ children, ...props }: HStackProps) {
  const composedStyle = useComposedStyle<ViewStyle>({
    base: style.hStack,
    props,
  });

  return (
    <ScrollableView {...props} style={composedStyle}>
      {children}
    </ScrollableView>
  );
}
