import {
  ScrollView,
  ScrollViewProps,
  StyleSheet,
  View,
  ViewProps,
  ViewStyle,
  StyleProp,
} from "react-native";
import { useTheme } from "@contexts/ThemeProvider";
import { forwardRef, RefObject, useMemo } from "react";
import { splitScrollableStyles } from "./splitScrollableStyles";
import { extractStyleProps } from "./viewStyleKeys";

type ScrollableViewExtraProps = Pick<
  ScrollViewProps,
  "contentContainerStyle" | "keyboardShouldPersistTaps"
>;

export type ScrollableViewProps = ViewProps &
  ViewStyle &
  ScrollableViewExtraProps & {
    style?: StyleProp<ViewStyle>;
    scrollable?: boolean;
  };

export const ScrollableView = forwardRef<
  View | ScrollView,
  ScrollableViewProps
>(function ScrollableView(
  { scrollable, style, contentContainerStyle, children, ...props },
  ref,
) {
  const theme = useTheme();

  const { styleProps, viewProps } = useMemo(
    () => extractStyleProps(props),
    [props],
  );

  const themedStyle = useMemo(
    () =>
      StyleSheet.flatten([
        { backgroundColor: theme.surface.primary },
        styleProps,
        style,
      ]),
    [theme.surface.primary, styleProps, style],
  );

  const { scrollStyle, contentStyle } = useMemo(
    () => splitScrollableStyles(themedStyle),
    [themedStyle],
  );

  const mergedContentContainerStyle = useMemo(
    () => StyleSheet.flatten([contentStyle, contentContainerStyle]),
    [contentStyle, contentContainerStyle],
  );

  if (scrollable) {
    return (
      <ScrollView
        {...viewProps}
        style={scrollStyle}
        contentContainerStyle={mergedContentContainerStyle}
        alwaysBounceVertical={false}
        ref={ref as RefObject<ScrollView>}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View {...viewProps} style={themedStyle} ref={ref as RefObject<View>}>
      {children}
    </View>
  );
});
