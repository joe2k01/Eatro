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

export function Text({ children, ...props }: TextProps) {
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
