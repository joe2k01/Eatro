import { ScrollableView, ScrollableViewProps } from "./ScrollableView";
import { SpacingKey, spacing } from "@constants/theme";
import { useMemo } from "react";
import { ViewStyle, StyleProp, StyleSheet } from "react-native";

export type HStackProps = ScrollableViewProps & {
  gap?: SpacingKey;
};

export function HStack({ gap, style, children, ...props }: HStackProps) {
  const stackStyle: StyleProp<ViewStyle> = useMemo(() => {
    const baseStyle: ViewStyle = {
      flexDirection: "row",
      gap: spacing(gap),
    };
    // User style first, then base style takes precedence
    return StyleSheet.compose(style, baseStyle);
  }, [gap, style]);

  return (
    <ScrollableView {...props} style={stackStyle}>
      {children}
    </ScrollableView>
  );
}
