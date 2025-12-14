import { useMemo } from "react";
import {
  ImageStyle,
  StyleProp,
  StyleSheet,
  TextStyle,
  ViewStyle,
} from "react-native";

type Style = ViewStyle | TextStyle | ImageStyle;

type UseComposedStyleProps<S extends Style> = {
  base?: StyleProp<S>;
  props: StyleProp<S> & { style?: StyleProp<S> };
};

export function useComposedStyle<S extends Style>({
  base,
  props,
}: UseComposedStyleProps<S>): StyleProp<S> {
  return useMemo(() => {
    const propsStyle = StyleSheet.compose<S, S, S>(base, props);
    return StyleSheet.compose(propsStyle, props.style);
  }, [base, props]);
}
