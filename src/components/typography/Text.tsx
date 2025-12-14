import { useComposedStyle } from "@hooks/useComposedStyle";
import {
  Text as NativeText,
  TextStyle,
  type TextProps as NativeTextProps,
} from "react-native";

type TextProps = NativeTextProps & TextStyle;

export function Text({ children, ...props }: TextProps) {
  const composedStyle = useComposedStyle({ props });

  return (
    <NativeText {...props} style={composedStyle}>
      {children}
    </NativeText>
  );
}
