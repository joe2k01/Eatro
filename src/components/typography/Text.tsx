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
  { label: "Massive", textProps: { fontSize: 32, fontWeight: "bold" } },
  { label: "Headline", textProps: { fontSize: 26, fontWeight: "bold" } },
  {
    label: "Title1",
    textProps: { fontSize: 22 },
  },
  { label: "TextBody", textProps: { fontSize: 16 } },
  { label: "TextCaption", textProps: { fontSize: 12 } },
] as const;

export const { Massive, TextBody, Headline, Title1, TextCaption } =
  textVariants.reduce(
    (acc, { label, textProps }) => {
      acc[label] = function ({ children, ...props }: TextProps) {
        return (
          <Text {...props} {...textProps}>
            {children}
          </Text>
        );
      };
      return acc;
    },
    {} as Record<(typeof textVariants)[number]["label"], typeof Text>,
  );
