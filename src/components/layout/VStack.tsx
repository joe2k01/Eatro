import { useComposedStyle } from "@hooks/useComposedStyle";
import { StyleSheet, View, ViewProps, ViewStyle } from "react-native";

export type VStackProps = Omit<ViewStyle, "display" | "flexDirection"> &
  ViewProps;

const style = StyleSheet.create({
  vStack: {
    display: "flex",
    flexDirection: "column",
  },
});

export function VStack({ children, ...props }: VStackProps) {
  const composedStyle = useComposedStyle({ base: style.vStack, props });

  return (
    <View {...props} style={composedStyle}>
      {children}
    </View>
  );
}
