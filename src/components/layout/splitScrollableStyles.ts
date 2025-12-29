import type { ViewStyle } from "react-native";

/**
 * For ScrollView, some layout props must be applied to `contentContainerStyle`
 * (e.g. padding, alignItems, gap), while others belong on the outer `style`
 * (e.g. backgroundColor, borderRadius, flex).
 *
 * This helper splits a flattened `ViewStyle` accordingly.
 */
export function splitScrollableStyles(style: ViewStyle): {
  scrollStyle: ViewStyle;
  contentStyle: ViewStyle;
} {
  const scrollStyle: ViewStyle = {};
  const contentStyle: ViewStyle = {};

  for (const key in style) {
    const k = key as keyof ViewStyle;
    const v = style[k];
    if (v === undefined) continue;

    // Padding belongs to the content container (ScrollView's children).
    if (k.startsWith("padding")) {
      (contentStyle as ViewStyle)[k] = v as never;
      continue;
    }

    // Layout props that must affect children should be in contentContainerStyle.
    switch (k) {
      case "gap":
      case "rowGap":
      case "columnGap":
      case "alignItems":
      case "justifyContent":
      case "flexWrap":
      case "flexGrow":
      case "flexShrink":
      case "flexBasis":
        (contentStyle as ViewStyle)[k] = v as never;
        continue;
      default:
        (scrollStyle as ViewStyle)[k] = v as never;
        continue;
    }
  }

  return { scrollStyle, contentStyle };
}
