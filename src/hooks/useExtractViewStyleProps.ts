import type { StyleProp } from "react-native";
import { ViewStyle, TextStyle, ImageStyle } from "react-native";
import { Style } from "@constants/theme";
import { useMemo } from "react";

type StyleType = ViewStyle | TextStyle | ImageStyle;

// Runtime list of valid ViewStyle keys to prevent style-like props
// from being forwarded to native components as unknown props
const VIEW_STYLE_KEYS = new Set<string>([
  // FlexStyle
  "alignContent",
  "alignItems",
  "alignSelf",
  "aspectRatio",
  "borderBottomWidth",
  "borderEndWidth",
  "borderLeftWidth",
  "borderRightWidth",
  "borderStartWidth",
  "borderTopWidth",
  "borderWidth",
  "bottom",
  "boxSizing",
  "display",
  "end",
  "flex",
  "flexBasis",
  "flexDirection",
  "rowGap",
  "gap",
  "columnGap",
  "flexGrow",
  "flexShrink",
  "flexWrap",
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
  "start",
  "top",
  "width",
  "zIndex",
  "direction",
  "inset",
  "insetBlock",
  "insetBlockEnd",
  "insetBlockStart",
  "insetInline",
  "insetInlineEnd",
  "insetInlineStart",
  "marginBlock",
  "marginBlockEnd",
  "marginBlockStart",
  "marginInline",
  "marginInlineEnd",
  "marginInlineStart",
  "paddingBlock",
  "paddingBlockEnd",
  "paddingBlockStart",
  "paddingInline",
  "paddingInlineEnd",
  "paddingInlineStart",
  // ShadowStyleIOS
  "shadowColor",
  "shadowOffset",
  "shadowOpacity",
  "shadowRadius",
  // TransformsStyle
  "transform",
  "transformOrigin",
  "transformMatrix",
  "rotation",
  "scaleX",
  "scaleY",
  "translateX",
  "translateY",
  // ViewStyle
  "backfaceVisibility",
  "backgroundColor",
  "borderBlockColor",
  "borderBlockEndColor",
  "borderBlockStartColor",
  "borderBottomColor",
  "borderBottomEndRadius",
  "borderBottomLeftRadius",
  "borderBottomRightRadius",
  "borderBottomStartRadius",
  "borderColor",
  "borderCurve",
  "borderEndColor",
  "borderEndEndRadius",
  "borderEndStartRadius",
  "borderLeftColor",
  "borderRadius",
  "borderRightColor",
  "borderStartColor",
  "borderStartEndRadius",
  "borderStartStartRadius",
  "borderStyle",
  "borderTopColor",
  "borderTopEndRadius",
  "borderTopLeftRadius",
  "borderTopRightRadius",
  "borderTopStartRadius",
  "outlineColor",
  "outlineOffset",
  "outlineStyle",
  "outlineWidth",
  "opacity",
  "elevation",
  "pointerEvents",
  "isolation",
  "cursor",
  "boxShadow",
  "filter",
  "mixBlendMode",
  "experimental_backgroundImage",
  // Text/Image color
  "color",
]);

/**
 * Simplified prop extraction hook
 * Separates style props from passthrough props
 * Memoized for performance
 */
export function useExtractViewStyleProps<T extends Record<string, unknown>>(
  props: T,
): {
  passthroughProps: Omit<T, "style">;
  styleProps: Style & { style?: StyleProp<Style> };
} {
  return useMemo(() => {
    const styleProps: Record<string, unknown> = {};
    const passthroughProps: Partial<Omit<T, "style">> = {};

    Object.entries(props).forEach(([key, value]) => {
      if (key === "style" || VIEW_STYLE_KEYS.has(key)) {
        styleProps[key] = value;
      } else {
        passthroughProps[key] = value;
      }
    });

    return {
      passthroughProps: passthroughProps as Omit<T, "style">,
      styleProps: styleProps as Style & { style?: StyleProp<Style> },
    };
  }, [props]);
}
