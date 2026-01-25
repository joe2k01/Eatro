import { ViewStyle, ViewProps } from "react-native";

// ViewStyle keys that can be passed as direct props
export const VIEW_STYLE_KEYS = new Set([
  "alignContent",
  "alignItems",
  "alignSelf",
  "aspectRatio",
  "backfaceVisibility",
  "backgroundColor",
  "borderBottomColor",
  "borderBottomLeftRadius",
  "borderBottomRightRadius",
  "borderBottomWidth",
  "borderColor",
  "borderLeftColor",
  "borderLeftWidth",
  "borderRadius",
  "borderRightColor",
  "borderRightWidth",
  "borderStyle",
  "borderTopColor",
  "borderTopLeftRadius",
  "borderTopRightRadius",
  "borderTopWidth",
  "borderWidth",
  "bottom",
  "display",
  "elevation",
  "flex",
  "flexBasis",
  "flexDirection",
  "flexGrow",
  "flexShrink",
  "flexWrap",
  "gap",
  "height",
  "justifyContent",
  "left",
  "margin",
  "marginBottom",
  "marginEnd",
  "marginHorizontal",
  "marginLeft",
  "marginRight",
  "marginStart",
  "marginTop",
  "marginVertical",
  "maxHeight",
  "maxWidth",
  "minHeight",
  "minWidth",
  "opacity",
  "overflow",
  "padding",
  "paddingBottom",
  "paddingEnd",
  "paddingHorizontal",
  "paddingLeft",
  "paddingRight",
  "paddingStart",
  "paddingTop",
  "paddingVertical",
  "position",
  "right",
  "rowGap",
  "columnGap",
  "top",
  "width",
  "zIndex",
]);

/**
 * Separates ViewStyle props from ViewProps
 */
export function extractStyleProps<P extends Record<string, unknown>>(
  props: P,
): { styleProps: ViewStyle; viewProps: Omit<P, keyof ViewStyle> } {
  const styleProps: ViewStyle = {};
  const viewProps: Record<string, unknown> = {};

  Object.entries(props).forEach(([key, value]) => {
    if (VIEW_STYLE_KEYS.has(key)) {
      (styleProps as Record<string, unknown>)[key] = value;
    } else {
      viewProps[key] = value;
    }
  });

  return { styleProps, viewProps: viewProps as Omit<P, keyof ViewStyle> };
}
