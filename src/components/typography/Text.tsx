import { Typography } from "@constants/theme";
import { useTheme } from "@contexts/ThemeProvider";
import { useMemo } from "react";
import {
  Text as NativeText,
  StyleSheet,
  TextStyle,
  TextProps as NativeTextProps,
  StyleProp,
} from "react-native";

// TextStyle property keys for separation
const TEXT_STYLE_KEYS = new Set([
  "color",
  "fontFamily",
  "fontSize",
  "fontStyle",
  "fontWeight",
  "letterSpacing",
  "lineHeight",
  "textAlign",
  "textDecorationLine",
  "textDecorationStyle",
  "textDecorationColor",
  "textShadowColor",
  "textShadowOffset",
  "textShadowRadius",
  "textTransform",
  "fontVariant",
  "writingDirection",
  "includeFontPadding",
  "textAlignVertical",
]);

export type TextProps = NativeTextProps &
  TextStyle & {
    style?: StyleProp<TextStyle>;
  };

type TypographyVariant = keyof typeof Typography;

/**
 * Base Text component with theme-aware default color.
 * Accepts all standard TextProps plus inline TextStyle props.
 */
export function Text({ children, style, ...props }: TextProps) {
  const theme = useTheme();

  const composedStyle = useMemo(() => {
    // Extract TextStyle props from props
    const styleFromProps: TextStyle = {};
    const textProps: NativeTextProps = {};

    Object.entries(props).forEach(([key, value]) => {
      if (TEXT_STYLE_KEYS.has(key)) {
        (styleFromProps as Record<string, unknown>)[key] = value;
      } else {
        (textProps as Record<string, unknown>)[key] = value;
      }
    });

    return {
      textProps,
      style: StyleSheet.flatten([
        { color: theme.text.primary },
        styleFromProps,
        style,
      ]),
    };
  }, [props, style, theme.text.primary]);

  return (
    <NativeText {...composedStyle.textProps} style={composedStyle.style}>
      {children}
    </NativeText>
  );
}

/**
 * Creates a typography variant component with preset styles.
 */
function createVariant(variant: TypographyVariant) {
  const variantStyle = Typography[variant];

  return function TypographyComponent({ children, style, ...props }: TextProps) {
    const mergedStyle = useMemo(
      () => StyleSheet.flatten([variantStyle, style]),
      [style],
    );

    return (
      <Text {...props} style={mergedStyle}>
        {children}
      </Text>
    );
  };
}

// Typography variant components
export const Display = createVariant("display");
export const Heading = createVariant("heading");
export const Title = createVariant("title");
export const Body = createVariant("body");
export const Caption = createVariant("caption");
export const Label = createVariant("label");

// Legacy aliases for backward compatibility
export const Massive = Display;
export const Headline = Heading;
export const Title1 = Title;
export const TextBody = Body;
export const TextCaption = Caption;
