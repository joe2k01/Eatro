import { StyledViewProps } from "@constants/theme";
import {
  ScrollView,
  ScrollViewProps,
  StyleSheet,
  View,
  ViewProps,
  ViewStyle,
} from "react-native";
import { useTheme } from "@contexts/ThemeProvider";
import { forwardRef, RefObject, useMemo } from "react";
import { useComposedStyle } from "@hooks/useComposedStyle";
import { splitScrollableStyles } from "./splitScrollableStyles";
import { useExtractViewStyleProps } from "@hooks/useExtractViewStyleProps";

type ScrollableViewExtraProps = Pick<
  ScrollViewProps,
  "contentContainerStyle" | "keyboardShouldPersistTaps"
>;

export type ScrollableViewProps = StyledViewProps<
  ViewStyle & ViewProps & ScrollableViewExtraProps & { scrollable?: boolean }
>;

export const ScrollableView = forwardRef<
  View | ScrollView,
  ScrollableViewProps
>(function ScrollableView(props: ScrollableViewProps, ref) {
  const { bg } = useTheme();

  // Keep the base background stable while still reacting to theme changes.
  const baseBackground = useMemo(() => ({ backgroundColor: bg }), [bg]);

  const { passthroughProps, styleProps } = useExtractViewStyleProps(props);

  const themedStyle = useComposedStyle<ViewStyle>({
    base: baseBackground,
    props: styleProps,
  });

  const { scrollStyle, contentStyle } = useMemo(
    () => splitScrollableStyles(themedStyle),
    [themedStyle],
  );
  const mergedContentContainerStyle = useMemo(
    () =>
      StyleSheet.flatten([
        contentStyle,
        passthroughProps.contentContainerStyle,
      ]),
    [contentStyle, passthroughProps.contentContainerStyle],
  );

  if (passthroughProps.scrollable) {
    return (
      <ScrollView
        {...passthroughProps}
        style={scrollStyle}
        contentContainerStyle={mergedContentContainerStyle}
        alwaysBounceVertical={false}
        ref={ref as RefObject<ScrollView>}
      >
        {passthroughProps.children}
      </ScrollView>
    );
  }

  return (
    <View
      {...passthroughProps}
      style={themedStyle}
      ref={ref as RefObject<View>}
    >
      {passthroughProps.children}
    </View>
  );
});
