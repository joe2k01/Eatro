import type { TextStyle, ViewStyle, ImageStyle } from "react-native";

export const IconSizes = {
  s: 20,
  m: 32,
  l: 50,
} as const;

export type IconSize = keyof typeof IconSizes;

export type Dimension = 0 | 0.5 | 1 | 1.5 | 2 | 3 | 4;
export const DimensionSize = 8;

type ColourTypes =
  | "primary"
  | "secondary"
  | "accent"
  | "bg"
  | "fg"
  | "card"
  | "popover"
  | "muted"
  | "destructive";

export type ThemeVariant = {
  [K in ColourTypes]: string;
} & {
  [FG in Exclude<ColourTypes, "bg" | "fg"> as `fg${Capitalize<FG>}`]: string;
};

type AllColours = keyof ThemeVariant;

export type Theme = {
  light: ThemeVariant;
  dark: ThemeVariant;
};

export const EatroTheme: Theme = {
  light: {
    bg: "#FBF8F2",
    fg: "#141412",
    card: "#EFE8DD",
    fgCard: "#141412",
    popover: "#F4EEE4",
    fgPopover: "#141412",
    // Community / trust
    primary: "#1F6F4A",
    fgPrimary: "#FFFFFF",
    // Food / warmth (good for CTAs, highlights)
    secondary: "#F2B84B",
    fgSecondary: "#141412",
    // Individual ownership (badges, chips, “my contributions”)
    accent: "#C56A3D",
    fgAccent: "#FFF7F0",
    muted: "#6A655D",
    fgMuted: "#EFE8DD",
    destructive: "#D64545",
    fgDestructive: "#FFFFFF",
  },

  dark: {
    bg: "#0F1411",
    fg: "#F6F3ED",
    card: "#18201B",
    fgCard: "#F6F3ED",
    popover: "#121A15",
    fgPopover: "#F6F3ED",
    primary: "#3ABF84",
    fgPrimary: "#08100C",
    secondary: "#F3C56B",
    fgSecondary: "#0B0F0C",
    accent: "#D08B5B",
    fgAccent: "#101312",
    muted: "#2A332E",
    fgMuted: "#9AA79F",
    destructive: "#FF6B6B",
    fgDestructive: "#101312",
  },
};

export type PaddingProps = Extract<keyof ViewStyle, `padding${string}`>;
export type DimensionPaddingProps = { [K in PaddingProps]?: Dimension };
export type ViewPaddingStyle = Pick<ViewStyle, PaddingProps>;
export type PaddedViewProps<P> = P extends ViewPaddingStyle
  ? Omit<P, PaddingProps> & DimensionPaddingProps
  : P;
export const PaddingPropsConcrete: PaddingProps[] = [
  "padding",
  "paddingBlock",
  "paddingBlockEnd",
  "paddingBlockStart",
  "paddingBottom",
  "paddingEnd",
  "paddingHorizontal",
  "paddingInline",
  "paddingInlineEnd",
  "paddingInlineStart",
  "paddingLeft",
  "paddingRight",
  "paddingStart",
  "paddingTop",
  "paddingVertical",
];

export type GapProps = Extract<keyof ViewStyle, "gap">;
export type DimensionGapProps = { [K in GapProps]?: Dimension };
export type ViewGapStyle = Pick<ViewStyle, GapProps>;
export type GapViewProps<P> = P extends ViewGapStyle
  ? Omit<P, GapProps> & DimensionGapProps
  : P;
export const GapPropsConcrete: GapProps[] = ["gap"];

/**
 * Style props that can be mapped from a theme token (e.g. "popover") to a real colour.
 *
 * Note: we intentionally allow raw strings too (e.g. "transparent", "#fff").
 */
export type ColourProps = "color" | "backgroundColor" | "borderColor";
export type ThemeColourProps = { [K in ColourProps]?: AllColours | string };
export type ViewColourStyle = Pick<
  TextStyle & ViewStyle & ImageStyle,
  ColourProps
>;
export type ColourViewProps<P> = P extends ViewColourStyle
  ? Omit<P, ColourProps> & ThemeColourProps
  : P;
export const ColourPropsConcrete: ColourProps[] = [
  "color",
  "backgroundColor",
  "borderColor",
];

export type Style = ViewStyle | TextStyle | ImageStyle;

export type StyledViewProps<P> = PaddedViewProps<
  GapViewProps<ColourViewProps<P>>
>;
