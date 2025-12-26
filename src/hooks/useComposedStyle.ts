import {
  DimensionGapProps,
  DimensionPaddingProps,
  ColourPropsConcrete,
  GapPropsConcrete,
  PaddingPropsConcrete,
  Style,
  ThemeColourProps,
  ThemeVariant,
  ViewGapStyle,
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

function handleGap<S extends Style>(props: S): S {
  const toReplace = GapPropsConcrete.filter((p) => p in props);

  let convertedProps: ViewGapStyle | undefined;
  if (toReplace.length) {
    const accessibleProps = props as Required<DimensionGapProps>;
    convertedProps = toReplace.reduce((acc, p) => {
      acc[p] = intoThemeDimension(accessibleProps[p]);
      return acc;
    }, {} as ViewGapStyle);
  }

  return convertedProps ? { ...props, ...convertedProps } : props;
}

function handleColour<S extends Style>(props: S, theme: ThemeVariant): S {
  const toReplace = ColourPropsConcrete.filter((p) => p in props);

  if (!toReplace.length) {
    return props;
  }

  const accessibleProps = props as Required<ThemeColourProps>;

  const converted = toReplace.reduce(
    (acc, p) => {
      const v = accessibleProps[p];
      if (typeof v === "string" && v in theme) {
        acc[p] = theme[v as keyof ThemeVariant];
      }
      return acc;
    },
    {} as Record<string, unknown>,
  );

  return { ...props, ...converted } as S;
}

export function useComposedStyle<S extends Style>({
  base,
  props,
}: UseComposedStyleProps<S>): Style {
  const theme = useTheme();

  return useMemo(() => {
    const paddedProps = handlePadding(props);
    const gapProps = handleGap(paddedProps);
    const colouredProps = handleColour(gapProps, theme);

    const colouredBase = handleColour(base ?? ({} as S), theme);

    const propsStyle = StyleSheet.compose<S, S, S>(colouredBase, colouredProps);
    return StyleSheet.flatten(StyleSheet.compose(propsStyle, props.style));
  }, [base, props, theme]) as S;
}
