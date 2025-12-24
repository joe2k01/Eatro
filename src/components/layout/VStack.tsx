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

  // const { bg } = useTheme();

  // const themeStyle = useMemo(
  //   () =>
  //     StyleSheet.create({
  //       background: {
  //         backgroundColor: bg,
  //       },
  //     }),
  //   [bg],
  // );

  return (
    <ScrollableView {...props} style={composedStyle}>
      {children}
    </ScrollableView>
  );
}
