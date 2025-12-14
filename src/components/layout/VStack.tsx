import { StyledViewProps } from "@constants/theme";
import { useTheme } from "@contexts/ThemeProvider";
import { useComposedStyle } from "@hooks/useComposedStyle";
import { useMemo } from "react";
import { StyleSheet, View, ViewProps, ViewStyle } from "react-native";

export type VStackProps = StyledViewProps<
  Omit<ViewStyle, "display" | "flexDirection"> & ViewProps
>;

const style = StyleSheet.create({
  vStack: {
    display: "flex",
    flexDirection: "column",
  },
});

export function VStack({ children, ...props }: VStackProps) {
  const composedStyle = useComposedStyle<ViewStyle>({
    base: style.vStack,
    props,
  });

  const { bg } = useTheme();

  const themeStyle = useMemo(
    () =>
      StyleSheet.create({
        background: {
          backgroundColor: bg,
        },
      }),
    [bg],
  );

  return (
    <View {...props} style={[themeStyle.background, composedStyle]}>
      {children}
    </View>
  );
}
