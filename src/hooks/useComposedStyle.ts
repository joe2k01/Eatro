import {
  ColourPropsConcrete,
  DimensionPaddingProps,
  PaddingPropsConcrete,
  Style,
  ThemeColourProps,
  ThemeVariant,
  ViewColourStyle,
  ViewPaddingStyle,
} from "@constants/theme";
import { useMemo } from "react";
import { StyleProp, StyleSheet } from "react-native";
import { intoThemeDimension } from "./useThemeDimension";
import { useTheme } from "@contexts/ThemeProvider";

type UseComposedStyleProps<S extends Style> = {
  base?: S;
  props: S & { style?: StyleProp<S> };
};

function handlePadding<S extends Style>(props: S): S {
  const toReplace = PaddingPropsConcrete.filter((p) => p in props);

  let convertedProps: ViewPaddingStyle | undefined;
  if (toReplace.length) {
    // This is type safe since toReplace has lenght, so all keys in array exist.
    const accessibleProps = props as Required<DimensionPaddingProps>;

    convertedProps = toReplace.reduce((acc, p) => {
      acc[p] = intoThemeDimension(accessibleProps[p]);
      return acc;
    }, {} as ViewPaddingStyle);
  }

  return convertedProps ? { ...props, ...convertedProps } : props;
}

function handleColour<S extends Style>(props: S, theme: ThemeVariant): S {
  const toReplace = ColourPropsConcrete.filter((p) => p in props);

  let convertedProps: ViewColourStyle | undefined;
  if (toReplace.length) {
    const accessibleProps = props as Required<ThemeColourProps>;

    convertedProps = toReplace.reduce((acc, p) => {
      acc[p] = theme[accessibleProps[p]];
      return acc;
    }, {} as ViewColourStyle);
  }

  return convertedProps ? { ...props, ...convertedProps } : props;
}

export function useComposedStyle<S extends Style>({
  base,
  props,
}: UseComposedStyleProps<S>): StyleProp<S> {
  const theme = useTheme();

  return useMemo(() => {
    const paddedProps = handlePadding(props);
    const colouredProps = handleColour(paddedProps, theme);

    const propsStyle = StyleSheet.compose<S, S, S>(base, colouredProps);
    return StyleSheet.compose(propsStyle, props.style);
  }, [base, props, theme]);
}
