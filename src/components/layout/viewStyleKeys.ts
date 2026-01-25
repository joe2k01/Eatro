import { ViewStyle } from "react-native";
import { Spacing, SpacingKey } from "@constants/theme";

// Props that should auto-convert SpacingKey to pixels
const SPACING_PROPS = new Set([
  "padding",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "paddingHorizontal",
  "paddingVertical",
  "paddingStart",
  "paddingEnd",
  "paddingBlock",
  "paddingInline",
  "margin",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",
  "marginHorizontal",
  "marginVertical",
  "marginStart",
  "marginEnd",
  "gap",
  "rowGap",
  "columnGap",
]);

// Check if value is a valid SpacingKey
function isSpacingKey(value: unknown): value is SpacingKey {
  return typeof value === "number" && value in Spacing;
}

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
 * Separates ViewStyle props from ViewProps.
 * Automatically converts SpacingKey values to pixels for padding/margin/gap props.
 */
export function extractStyleProps<P extends Record<string, unknown>>(
  props: P,
): { styleProps: ViewStyle; viewProps: Omit<P, keyof ViewStyle> } {
  const styleProps: ViewStyle = {};
  const viewProps: Record<string, unknown> = {};

  Object.entries(props).forEach(([key, value]) => {
    if (VIEW_STYLE_KEYS.has(key)) {
      // Auto-convert SpacingKey to pixels for spacing props
      if (SPACING_PROPS.has(key) && isSpacingKey(value)) {
        (styleProps as Record<string, unknown>)[key] = Spacing[value];
      } else {
        (styleProps as Record<string, unknown>)[key] = value;
      }
    } else {
      viewProps[key] = value;
    }
  });

  return { styleProps, viewProps: viewProps as Omit<P, keyof ViewStyle> };
}
