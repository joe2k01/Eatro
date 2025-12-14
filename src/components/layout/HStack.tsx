import { useComposedStyle } from "@hooks/useComposedStyle";
import { StyleSheet, View, ViewProps, ViewStyle } from "react-native";

export type HStackProps = Omit<ViewStyle, "display" | "flexDirection"> &
  ViewProps;

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
    <View {...props} style={composedStyle}>
      {children}
    </View>
  );
}
