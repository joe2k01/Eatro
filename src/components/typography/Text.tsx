import { StyledViewProps } from "@constants/theme";
import { useTheme } from "@contexts/ThemeProvider";
import { useComposedStyle } from "@hooks/useComposedStyle";
import { useMemo } from "react";
import {
  Text as NativeText,
  StyleSheet,
  TextStyle,
  type TextProps as NativeTextProps,
} from "react-native";

type TextProps = StyledViewProps<NativeTextProps & TextStyle>;

function Text({ children, ...props }: TextProps) {
  const { fg } = useTheme();

  const colourStyle = useMemo(
    () => StyleSheet.create({ colour: { color: fg } }),
    [fg],
  );

  const composedStyle = useComposedStyle<TextStyle>({
    base: colourStyle.colour,
    props,
  });

  return (
    <NativeText {...props} style={composedStyle}>
      {children}
    </NativeText>
  );
}

const textVariants = [
  { label: "Headline", size: 26 },
  {
    label: "Title1",
    size: 22,
  },
  { label: "TextBody", size: 16 },
] as const;

export const { TextBody, Headline, Title1 } = textVariants.reduce(
  (acc, { label, size }) => {
    acc[label] = function ({ children, ...props }: TextProps) {
      return (
        <Text {...props} fontSize={size}>
          {children}
        </Text>
      );
    };
    return acc;
  },
  {} as Record<(typeof textVariants)[number]["label"], typeof Text>,
);
