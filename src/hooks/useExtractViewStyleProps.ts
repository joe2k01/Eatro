import type { StyleProp, ViewStyle } from "react-native";
import { useEffect, useRef, useState } from "react";
import * as Sentry from "@sentry/react-native";

// A runtime list of valid `ViewStyle` keys (RN 0.81.x), used to prevent
// style-like props from being forwarded to native components as unknown props.
//
// Source: `react-native/Libraries/StyleSheet/StyleSheetTypes.d.ts`
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

  // `StyledViewProps` also allows `color` tokens for Text/Image usage; ensure those
  // never get forwarded to native as unknown props.
  "color",
]);

function computeProps<T extends Record<string, unknown>>(
  current: T,
  discovered: Partial<T>,
  missingKeys: Set<string>,
): T {
  // We only mutate the objects if values differ or keys have been removed
  if (!missingKeys.size && !Object.keys(discovered).length) {
    return current;
  }

  return Object.fromEntries(
    Object.entries({
      ...current,
      ...discovered,
    }).filter(([key]) => !missingKeys.has(key)),
  ) as T;
}

export function useExtractViewStyleProps<T extends Record<string, unknown>>(
  props: T,
): {
  passthroughProps: Omit<T, "style">;
  styleProps: ViewStyle & { style?: StyleProp<ViewStyle> };
} {
  const [styleProps, setStyleProps] = useState<Record<string, unknown>>({});
  const [passthroughProps, setPassthroughProps] = useState<Omit<T, "style">>(
    {} as Omit<T, "style">,
  );

  const styleRef = useRef<Record<string, unknown>>(styleProps);
  const passthroughRef = useRef<Omit<T, "style">>(passthroughProps);

  useEffect(() => {
    const start = Date.now();

    const newStyleProps: Record<string, unknown> = {};
    const newPassthroughProps: Partial<Omit<T, "style">> = {};

    const missingStyleKeys = new Set<string>(Object.keys(styleRef.current));
    const missingPassthroughKeys = new Set<string>(
      Object.keys(passthroughRef.current),
    );

    Object.entries(props).forEach(([key, value]) => {
      const isStyle = VIEW_STYLE_KEYS.has(key) || key === "style";
      const reference = isStyle ? styleRef.current : passthroughRef.current;
      const referenceTracker = isStyle
        ? missingStyleKeys
        : missingPassthroughKeys;

      const target = isStyle ? newStyleProps : newPassthroughProps;

      let shouldInsert = !(key in reference);

      if (key in reference) {
        const isObject = typeof reference[key] === "object";
        const isSameObject = isObject && Object.is(reference[key], value);

        shouldInsert = !isSameObject && reference[key] !== value;
      }

      if (shouldInsert) {
        target[key] = value;
      }

      referenceTracker.delete(key);
    });

    const prevStyle = styleRef.current;
    styleRef.current = computeProps(
      styleRef.current,
      newStyleProps,
      missingStyleKeys,
    );

    const prevPassthrough = passthroughRef.current;
    passthroughRef.current = computeProps(
      passthroughRef.current,
      newPassthroughProps,
      missingPassthroughKeys,
    );

    const end = Date.now();

    setStyleProps(styleRef.current);
    setPassthroughProps(passthroughRef.current);

    if (end - start > 100) {
      Sentry.captureMessage("useExtractViewStyleProps: Slow render", {
        extra: {
          props,
          previousStyle: prevStyle,
          previousPassthrough: prevPassthrough,
          newStyle: newStyleProps,
          newPassthrough: newPassthroughProps,
        },
      });
    }
  }, [props]);

  return { styleProps, passthroughProps };
}
