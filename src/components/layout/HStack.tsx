import { ScrollableView, ScrollableViewProps } from "./ScrollableView";
import { SpacingKey, spacing } from "@constants/theme";
import { useMemo } from "react";
import { ViewStyle, StyleSheet } from "react-native";

export type HStackProps = ScrollableViewProps & {
  gap?: SpacingKey;
};

export function HStack({ gap, style, children, ...props }: HStackProps) {
  const stackStyle = useMemo(() => {
    const baseStyle: ViewStyle = {
      flexDirection: "row",
      gap: spacing(gap),
    };
    // User style first, then base style takes precedence
    return StyleSheet.flatten([style, baseStyle]);
  }, [gap, style]);

  return (
    <ScrollableView {...props} style={stackStyle}>
      {children}
    </ScrollableView>
  );
}
