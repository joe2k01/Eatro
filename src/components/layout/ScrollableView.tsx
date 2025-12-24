import { StyledViewProps } from "@constants/theme";
import {
  ScrollView,
  StyleSheet,
  View,
  ViewProps,
  ViewStyle,
} from "react-native";
import { useTheme } from "@contexts/ThemeProvider";
import { forwardRef, RefObject, useMemo } from "react";
import { useComposedStyle } from "@hooks/useComposedStyle";

export type ScrollableViewProps = StyledViewProps<
  Omit<ViewStyle, "display" | "flexDirection"> &
    ViewProps & { scrollable?: boolean }
>;

export const ScrollableView = forwardRef<
  View | ScrollView,
  ScrollableViewProps
>(function ScrollableView(
  { children, scrollable, ...props }: ScrollableViewProps,
  ref,
) {
  const { bg } = useTheme();

  const { background } = useMemo(
    () => StyleSheet.create({ background: { backgroundColor: bg } }),
    [bg],
  );

  const themedStyle = useComposedStyle<ViewStyle>({
    base: background,
    props,
  });

  if (scrollable) {
    return (
      <ScrollView
        {...props}
        style={themedStyle}
        ref={ref as RefObject<ScrollView>}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View {...props} style={themedStyle} ref={ref as RefObject<View>}>
      {children}
    </View>
  );
});
