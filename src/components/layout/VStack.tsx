import { ScrollableView, ScrollableViewProps } from "./ScrollableView";
import { SpacingKey, spacing } from "@constants/theme";
import { useMemo } from "react";
import { ViewStyle, StyleProp, StyleSheet } from "react-native";

export type VStackProps = ScrollableViewProps & {
  gap?: SpacingKey;
};

export function VStack({ gap, style, children, ...props }: VStackProps) {
  const stackStyle: StyleProp<ViewStyle> = useMemo(() => {
    const baseStyle: ViewStyle = {
      flexDirection: "column",
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
